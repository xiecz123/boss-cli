const inquirer = require("inquirer"); // 创建交互式的命令行界面,就是这些问答的界面
const { TEMPLATE_REPOLIST } = require("./constants");

module.exports = {
  // 选择需要下载的模板
  getTemplate: () => {
    const questions = [
      {
        name: "repo",
        type: "list",
        message: "please choice a template to create project",
        choices: TEMPLATE_REPOLIST,
      },
    ];
    return inquirer.prompt(questions);
  },
  // 选择模板的版本
  getTag: (tags) => {
    const questions = [
      {
        name: "tag",
        type: "list",
        message: "please choise tags to create project",
        choices: tags,
      },
    ];
    return inquirer.prompt(questions);
  },

  // 模板初始化问题
  getInitQuestions: (projectName) => {
    const questions = [
      {
        name: "projectName",
        type: "input",
        message: "Project name",
        default: projectName,
      },
      {
        name: "description",
        type: "input",
        message: `Project description`,
        default: "这是随便写的项目描述",
      },
      {
        name: "author",
        type: "input",
        message: `Author`,
      },
      {
        name: "isNpmInstall",
        type: "list",
        message:
          "Should we run `npm install` for you after the project has been create?<recommended>",
        choices: ["yes", "no"],
      },
    ];
    return inquirer.prompt(questions);
  },
};
