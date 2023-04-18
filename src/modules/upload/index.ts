import inquirer from 'inquirer'
import chalk from 'chalk'
import { sep, isAbsolute, join } from 'path'
import fs from 'fs'

import { uploadParamsType, uploadConfigDataType } from '../../types/upload'
import { PROJECT_ENVIRONMENT } from '../../utils/constant'

import Load from './load'

const cwd = process.cwd()
const log = console.log
const list = [
  {
    type: 'confirm',
    message: '是否确认更新?',
    name: 'isUpdate',
    default: false,
    prefix: '提示:'
  }
]

class Upload {
  public static init(params: uploadParamsType) {
    this.handleConfigFilePathCheck()

    if (!this.handleParamsCheck(params)) {
      log(chalk.red`\n基本配置参数错误.\n`)
      process.exit(0)
    }

    params = this.handleParams(params)

    log(chalk.bgBlue`\n源信息`)
    log(chalk.blue`项目: ${params?.projectName} 环境: ${params.environment} 目录: ${params.distName}`)
    log(chalk.blue`是否直接更新: ${params?.isUpdate ?? false} 路径: ${params?.path}\n`)

    // 如果直接更新，不提示，否则提示选择是否需要更新
    if (params?.isUpdate) {
      const config = this.getConfigData(params)

      if (config) {
        Load.init(config)
      } else {
        log(chalk.yellow`\n无配置!\n`)
        process.exit(0)
      }
    } else {
      inquirer
        .prompt(list)
        .then((res) => {
          if (res && res.isUpdate) {
            const config = this.getConfigData(params)

            if (config) {
              Load.init(config)
            } else {
              log(chalk.yellow`\n无配置!\n`)
              process.exit(0)
            }
          } else {
            log(chalk.yellow`\n不更新!\n`)
            process.exit(0)
          }
        })
        .catch((err) => {
          log(chalk.red(`Upload init() inquirer error: \n ${err}`))
          process.exit(0)
        })
    }
  }

  /**
   * 获取配置信息
   * @param params 基础配置
   * @returns 配置信息
   */
  private static getConfigData(params: uploadParamsType): undefined | uploadConfigDataType {
    const configJson = this.getConfigFileContext()

    let result = void 0

    if (!configJson || !params.projectName) return result

    const { projectName, distName, path, environment } = params

    if (projectName in configJson) {
      const data = configJson[projectName]

      if (data?.isMultiPage) {
        if (distName in data) {
          const multiPageData = data[distName]

          result = multiPageData.environment === environment ? multiPageData : void 0
        } else {
          log(chalk.yellow`\n${projectName} ${distName} config is undefined.\n`)
        }
      } else {
        result = data.environment === environment ? data : void 0
      }
    } else {
      throw new Error(`upload.json file. No [${params.projectName}] project config`)
    }

    if (result) {
      Object.assign(result, { projectName, path })
    }

    return result
  }

  /**
   * 获取项目名称和项目路径
   * @param params 基础信息
   * @returns 基础信息
   */
  private static handleParams(params: uploadParamsType) {
    let packageContent: { [x: string]: any } = { name: '' }

    if (!params?.projectName) {
      const packagePath = `${cwd}${sep}package.json`

      try {
        packageContent = require(packagePath)
      } catch (error) {
        throw new Error(`Upload init require package.json error: ${error}`)
      }

      params.projectName = packageContent.name
    }

    params.path = `${cwd}${sep}`

    return params
  }

  /**
   * 获取配置信息 JSON
   * @returns json
   */
  private static getConfigFileContext(): any {
    const path = process.env.UPLOAD_CONFIG_PATH

    if (!path) return void 0

    const absolutePath = isAbsolute(path) ? path : join(cwd, path)

    try {
      const data = fs.readFileSync(absolutePath, { encoding: 'utf8' })

      return data && typeof data === 'string' ? JSON.parse(data) : void 0
    } catch (error) {
      throw new Error(`Red config file error: ${error}`)
    }
  }

  /**
   * 校验 UPLOAD_CONFIG_PATH 是否存在
   */
  private static handleConfigFilePathCheck() {
    if (!process.env.UPLOAD_CONFIG_PATH) {
      throw new Error('process.env.UPLOAD_CONFIG_PATH is undefined.')
    }
  }

  /**
   * 校验基础参数
   * @param param0 命令参数
   * @returns boolean
   */
  private static handleParamsCheck({ environment, distName }: uploadParamsType) {
    let result = true

    if (!PROJECT_ENVIRONMENT.includes(environment)) {
      log(chalk.yellow(`请传入正确项目环境: ${PROJECT_ENVIRONMENT.join(' || ')}`))
      result = false
    }

    if (!distName) {
      log(chalk.yellow('请传入打包文件夹名称'))
      result = false
    }

    return result
  }
}

export default Upload
