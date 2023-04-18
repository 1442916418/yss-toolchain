# yss-toolchain - 个人工具集

## 概览

1. [安装](#install)

2. [模块](#module)
   1. [日志模块](#build-log)
   2. [上传模块](#upload)

## [安装](#install)

<a name="install"></a>

```sh
npm install --save-dev yss-toolchain
```

---

## [模块](#module)

<a name="module"></a>

### [日志模块](#build-log)

<a name="build-log"></a>

> 单/多页面，多环境环境打包  
> 需要先在 `package.json` 里添加初始版本号

```shell
y-cli build-log
```

| 参数                      | 是否必填  | 名称   | 类型     | 默认值             | 说明    |
| ----------------------- | ----- | ---- | ------ | --------------- | ----- |
| --branch(-b)            | false | 分支   | array  | ['master']      | -     |
| --author(-a)            | false | 作者   | array  | ['Tom'] | -     |
| --environment(-e)       | false | 环境   | string | 'development'   | -     |
| --environmentSuffix(-s) | false | 分支后缀 | string | 'dev'           | 和 environment 对应     |
| --project(-p)           | false | 多页面   | string | 'null'          | 多页面使用，自定义多页面名称，不是项目项目 |

#### **初始版本号**  

- **单页面 package.json**  

```json
{
  "version": "1.0.0",
  "version_[environmentSuffix]": "1.0.0",
  "version_[environmentSuffix]": "1.0.0"
}
```

- **多页面 package.json**  

```json
{
  "version": "1.0.0",
  "[project]_version_[environmentSuffix]": "1.0.0",
  "[project]_version_[environmentSuffix]": "1.0.0",
  "[project]_version_[environmentSuffix]": "1.0.0",
  "[project]_version_[environmentSuffix]": "1.0.0"
}
```

- **示例**

单页面  

```shell
y-cli build-log -b dev -e development -s dev
```

多页面  

```shell
y-cli build-log -b dev -e development -s dev -p a
```

---

### [上传模块](#upload)

<a name="upload"></a>

> 自动上传并更新服务端包(node-ssh)  
> 需要先通过 cross-env 设置配置文件路径 UPLOAD_CONFIG_PATH(相对路径或绝对路径)  
> 服务端需要在目标目录下添加 unzip.sh 文件，用于解压压缩包

```shell
cross-env UPLOAD_CONFIG_PATH=test\\upload.prod.json y-cli upload
```

#### y-cli upload

| 参数                      | 是否必填  | 名称   | 类型     | 默认值             | 说明    |
| ----------------------- | ----- | ---- | ------ | --------------- | ----- |
| --environment(-e)       | false | 环境   | string | 'development'   | 'development' 或 'production' 二选一
| --directory(-d) | false | 打包目录 | string | 'dist'           | 需要上传的文件夹名称     |
| --update(-u) | false | 更新 | string | 'false'           | 是否自动更新     |

#### UPLOAD_CONFIG_PATH  

`JSON key`

| 参数                      | 是否必填  | 名称   | 类型     | 默认值             | 说明    |
| ----------------------- | ----- | ---- | ------ | --------------- | ----- |
| projectName       | true | 项目名称   | string | -   | package.json 的 name
| MultiPageBuildName       | true | 多页面名称   | string | -   | 自定义多页面名称或和打包目录文件名称相同
  
`JSON value`
  
| 参数                      | 是否必填  | 名称   | 类型     | 默认值             | 说明    |
| ----------------------- | ----- | ---- | ------ | --------------- | ----- |
| host       | true | IP   | string | -   | 插件 node-ssh 连接参数
| pathUrl       | true | 路径   | string | -   | 插件 node-ssh 连接参数  
| username       | true | 用户名   | string | -   | 插件 node-ssh 连接参数
| password       | true | 密码   | string | -   | 插件 node-ssh 连接参数
| privateKeyPath       | true | 文件密码   | string | -   | 插件 node-ssh 连接参数，与 password 二选一
| port       | true | 端口   | number | -   | 插件 node-ssh 连接参数
| environment       | true | 环境   | string | 'development'   | 'development' 或 'production' 二选一
| distName | true | 打包目录 | string | 'dist'           | 需要上传并压缩的文件夹名称     |
| isMultiPage | false | 多页面 | boolean | undefined           | 一个项目下，多页面使用     |

- UPLOAD_CONFIG_PATH 配置文件示例

```json
{
 "projectName": {
    "host": "111.00.00.111",
    "pathUrl": "/file",
    "username": "root",
    "password": "123456",
    "port": 22,
    "environment": "production",
    "distName": "dist"
  },
  "projectName": {
    "isMultiPage": true,
    "MultiPageBuildName": {
      "host": "111.00.00.111",
      "pathUrl": "/file/test1",
      "username": "root",
      "password": "MTIzNDU2",
      "port": 22,
      "environment": "production",
      "distName": "test-1"
    },
    "MultiPageBuildName": {
      "host": "111.00.00.111",
      "pathUrl": "/file/test2",
      "username": "root",
      "password": "MTIzNDU2",
      "port": 22,
      "environment": "production",
      "distName": "test-2"
    }
  }
}
```

- **示例**

```shell
cross-env UPLOAD_CONFIG_PATH=..\\upload.dev.json y-cli upload -e production -d dist -u true
```

- unzip.sh 示例

```shell
#!/bin/bash

unzip -o dist.zip
```
