import inquirer from "inquirer";
import shell from "shelljs";
import fs from "fs";
import json5 from "json5";
import dotenv from "dotenv";
import path from "path";
import process from "process";

inquirer
  .prompt([
    {
      type: "rawlist",
      name: "envType",
      message: "请选择需要构建的环境",
      choices: [
        { name: "生产环境", value: "production" },
        { name: "测试环境", value: "staging" },
      ],
    },
  ])
  .then((answers) => {
    // 获取环境配置
    getEnv(answers.envType);

    // 是否构建
    inquirer
      .prompt([
        {
          type: "confirm",
          name: "isConfirm",
          message: "是否构建",
        },
      ])
      .then((confirm) => {
        if (confirm.isConfirm) {
          // 更换pages.json的配置
          changePagesConfig(answers.envType);

          // 执行构建命令
          exec(answers.envType);
        }
      });
  })
  .catch((error) => {
    console.error("报错: ", error);
  });

function changePagesConfig(envType) {
  const pagesConfigStr = fs.readFileSync("./example/pages.json", {
    encoding: "utf-8",
  });
  
  const pagesConfig = json5.parse(pagesConfigStr);
  const titleMap = {
    production: "生产环境",
    staging: "测试环境",
  };
  pagesConfig.globalStyle.navigationBarTitleText = titleMap[envType];

  fs.writeFileSync(
    "./example/pages.json",
    JSON.stringify(pagesConfig, null, 2),
    {
      encoding: "utf-8",
    }
  );
}

function getEnv(envType) {
  const envPath = `.env.${envType}`;
  const envConfig = dotenv.config({
    path: path.resolve(process.cwd(), envPath),
    encoding: "utf8",
    debug: false,
  }).parsed;

  console.log("当前环境配置: ", envConfig);
}

function exec(envType) {
  const cli = `pnpm run ${envType}`;
  shell.exec(cli);
}
