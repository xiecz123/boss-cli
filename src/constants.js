const { version: VERSION } = require("../package.json");

// Darwin是由苹果电脑于2000年开发的一个开放原始码操作系统。
// 模板的临时下载目录
const DOWNLOAD_DIRECTORY = `${
  process.env[process.platform === "darwin" ? "HOME" : "USERPROFILE"]
}/.template`;

// 项目模板列表 vue项目模板和水墨文档全部代码
const TEMPLATE_REPOLIST = ["vue-admin-template", "ink-wash-docs"];

// git 用户名
const GIT_USER_NAME = "xiecz123";

const GITHUB_API_HOST = "https://api.github.com";

module.exports = {
  VERSION,
  DOWNLOAD_DIRECTORY,
  TEMPLATE_REPOLIST,
  GIT_USER_NAME,
  GITHUB_API_HOST,
};
