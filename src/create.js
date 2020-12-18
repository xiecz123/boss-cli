const fs = require("fs-extra");
const path = require("path"); // path.resolve 如果在处理完所有给定的 path 片段之后还未生成绝对路径，则会使用当前工作目录。
const axios = require("axios");
const ora = require("ora"); // 制作转圈效果
const chalk = require("chalk");
// const shell = require("shelljs");
// 传入一个遵循常见的错误优先的回调风格的函数（即以 (err, value) => ... 回调作为最后一个参数），并返回一个返回 promise 的版本。
const { promisify } = require("util");
const downloadGitReop = promisify(require("download-git-repo"));
const exec = promisify(require("child_process").exec);
const questions = require("./questions");
const {
  DOWNLOAD_DIRECTORY,
  GIT_USER_NAME,
  GITHUB_API_HOST,
} = require("./constants");

// https://api.github.com/repos/vuejs/vue/tags
// 获取该项目的 tags
const fechTagList = async (repo) => {
  const { data } = await axios.get(
    `${GITHUB_API_HOST}/repos/${GIT_USER_NAME}/${repo}/tags`
  );
  return data;
};

// loading 效果
const waitFnloading = (fn, message) => async (...args) => {
  const spinner = ora(message);
  spinner.start();
  const result = await fn(...args);
  //spinner.succeed();
  spinner.stop();
  ora(chalk.green(message + " succeed !")).succeed();
  return result;
};

// 下载仓库代码到临时文件夹，并返回该文件夹地址
const download = async (repo, tag) => {
  let api = `${GIT_USER_NAME}/${repo}`;
  if (tag) {
    api += `#${tag}`;
  }
  const dest = `${DOWNLOAD_DIRECTORY}/${repo}`;
  await downloadGitReop(api, dest);
  return dest;
};

const handlePackageJson = async (config, projectName, dest) => {
  const packageJsonPath = path.resolve(dest, "package.json");
  const packageJson = await fs
    .readJSON(packageJsonPath)
    .then((json) => {
      json.name = config.projectName;
      json.description = config.description;
      json.author = config.author;
      return json;
    })
    .then((json) => {
      return fs.writeJSON(packageJsonPath, json, {
        spaces: 2,
      });
    })
    .catch((err) => {
      console.error(err);
    });
  return packageJson;
};

// TODO 与自己安装相比用户看不到npm安装的过程
const npmInstall = async (projectName) => {
  await exec("npm install", {
    cwd: path.resolve(projectName),
  }).catch((err) => {
    console.error(err);
  });
};

const getAnswer = async (projectName) => {
  // 选择一个模板
  const { repo } = await questions.getTemplate();
  // 选择 tag 版本
  let tags = await waitFnloading(fechTagList, "fetching tags")(repo);
  let tag;
  if (tags.length > 0) {
    tags = tags.map((item) => item.name);
    const tagsRes = await questions.getTag(tags);
    tag = tagsRes.tag;
  }

  // 获取package.json 的相关配置
  const initConfig = await questions.getInitQuestions(projectName);

  return { repo, tag, initConfig };
};

const createTemplate = async (projectName) => {
  if (!projectName) {
    console.error(
      chalk.red(
        "no project name was given \nexample: boss-cli create myProject"
      )
    );
    process.exit(1);
  }
  // 先判断安装目录上有没有同名文件夹
  if (fs.pathExistsSync(path.resolve(projectName))) {
    console.error(
      chalk.red(`您创建的项目名:${projectName}已存在，请修改项目名后重试`)
    );

    process.exit(1);
  }

  const { repo, tag, initConfig } = await getAnswer(projectName);

  // 下载选择的模板代码
  const result = await waitFnloading(download, "download template")(repo, tag);
  // 更改配置
  const dest = `${DOWNLOAD_DIRECTORY}/${repo}`;
  await waitFnloading(handlePackageJson, "update package.json")(
    initConfig,
    projectName,
    dest
  );

  // 将项目从临时目录拷贝到安装目录
  await fs.copy(result, path.resolve(projectName));

  await fs.remove(DOWNLOAD_DIRECTORY).catch((err) => {
    console.error(err);
  });

  if (initConfig.isNpmInstall === "yes") {
    await waitFnloading(npmInstall, "npm install")(projectName);
  }
};
module.exports = createTemplate;
