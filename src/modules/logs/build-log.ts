import path from 'path'
import inquirer from 'inquirer'

import utils from '../../utils'
import { buildLogTypes } from '../../types/build-log'

const { sep } = path
const cwd = process.cwd()

class BuildLog {
  public static init(params?: buildLogTypes) {
    const packagePath = `${cwd}${sep}package.json`

    let packageContent: { [x: string]: any } = {
      version: '',
      version_prod: '',
      version_dev: ''
    }

    try {
      packageContent = require(packagePath)
    } catch (error) {
      throw new Error(`BuildLog init require package.json error: ${error}`)
    }

    const isMultiProject = params?.project && params.project !== 'null'
    const environment = params?.environment ?? 'development'
    const env = params?.environmentSuffix ? params.environmentSuffix : environment === 'development' ? 'dev' : 'prod'

    const logPath = `${cwd}${sep}logs${sep}${isMultiProject ? `build-${params.project}` : 'build'}.${env}.json`
    const versionKey = `${isMultiProject ? `${params.project}_` : ''}version_${env}`
    const prevVersion = packageContent[versionKey]
    const currentVersion = utils.common.updateVersionNumber({ version: prevVersion })

    const list = this.getConditionList(params)

    console.log(`${isMultiProject ? params.project : ''} ${environment} 更新打包日志: `)

    inquirer
      .prompt(list)
      .then((res) => {
        if (res) {
          const result = {
            ...res,
            version: currentVersion,
            environment,
            prevVersion,
            date: utils.common.formatDate()
          }

          if (isMultiProject) {
            result.project = params.project
          }

          utils.file.handleOverwriteWriteFile(logPath, result)
          utils.file.handleOverwriteWriteFile(
            packagePath,
            { version: currentVersion, [versionKey]: currentVersion },
            'json'
          )
        }
      })
      .catch((err) => {
        console.log('BuildLog init() inquirer error:\n', err)
      })
  }

  public static getConditionList(params?: buildLogTypes) {
    const branchList = params?.branchList ?? ['master']
    const authorList = params?.authorList ?? ['yushuisheng']
    const environment = params?.environment ?? 'development'
    const envName = environment === 'development' ? '测试' : environment === 'production' ? '正式' : environment

    return [
      {
        type: 'input',
        name: 'title',
        message: '请输入更新标题:',
        default: envName + '环境更新',
        validate: function (val: any) {
          if (!val) {
            return '请输入标题'
          }

          return true
        }
      },
      {
        type: 'input',
        name: 'describe',
        message: '请输入更新内容:',
        default: '修复 bug',
        validate: function (val: any) {
          if (!val) {
            return '请输入内容'
          }

          return true
        }
      },
      {
        type: 'list',
        name: 'author',
        message: '请选择更新作者:',
        default: authorList[0],
        choices: authorList,
        validate: function (val: any) {
          if (!val) {
            return '请选择更新作者'
          }

          return true
        }
      },
      {
        type: 'list',
        name: 'branch',
        message: '请选择更新分支:',
        default: branchList[0],
        choices: branchList,
        validate: function (val: any) {
          if (!val) {
            return '请选择更新分支'
          }

          return true
        }
      }
    ]
  }
}

export default BuildLog
