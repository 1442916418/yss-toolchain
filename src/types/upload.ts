import { PROJECT_ENVIRONMENT } from '../utils/constant'

export interface uploadParamsType {
  /** 项目名称 */
  projectName?: string
  /** 环境 */
  environment: typeof PROJECT_ENVIRONMENT[any]
  /** 打包结果文件夹 */
  distName: string
  /** 项目路径 */
  path?: string
  /** 是否直接更新(默认 false) */
  isUpdate: boolean
}

export interface uploadConfigDataType extends uploadParamsType {
  host: string
  pathUrl: string
  username: string
  password?: string
  privateKeyPath?: string
  port: number
}
