import fs from 'fs'
import { resolve, sep } from 'path'
import archiver from 'archiver'
import { NodeSSH } from 'node-ssh'
import chalk from 'chalk'

import { uploadConfigDataType } from '../../types/upload'

const ssh = new NodeSSH()
const log = console.log

class Load {
  private static distPath = ''
  private static params?: uploadConfigDataType = void 0

  public static init(params: uploadConfigDataType) {
    const { path, distName } = params

    this.distPath = `${path}${distName}`

    const isDist = fs.existsSync(this.distPath)

    if (!isDist) {
      log(chalk.red`打包文件夹不存在: ${this.distPath}`)
      process.exit(0)
    }

    log(chalk.bgMagenta`\n服务器信息`)
    log(chalk.magenta`host: ${params.host} pathUrl: ${params.pathUrl} port: ${params.port}`)
    log(
      chalk.magenta`username: ${
        params.username
      } password: ${!!params.password} privateKeyPath: ${!!params.privateKeyPath}\n`
    )

    this.params = params

    this.zipDirector()
  }

  /**
   * 第一步: 本地文件压缩
   */
  private static zipDirector() {
    if (!this.params) return

    log(chalk.blue`\n开始压缩\n`)

    const { distPath } = this

    const output = fs.createWriteStream(`${distPath}.zip`)

    const archive = archiver('zip', {
      zlib: { level: 5 } // 压缩层级
    }).on('error', (err) => {
      throw err
    })

    archive.on('error', (err: any) => {
      if (err) {
        log(chalk.red`error 压缩错误: ${err}\n`)
        process.exit(0)
      }
    })

    output.on('close', (err: any) => {
      if (err) {
        log(chalk.red`close 压缩错误: ${err}\n`)
        process.exit(0)
      }

      this.uploadFile()
    })

    output.on('end', () => {
      log(chalk.blue`fs.createWriteStream end\n`)
    })

    // 将存档数据传输到文件
    archive.pipe(output)

    // 存档
    archive.directory(resolve(distPath), false)

    // 完成存档（即，我们已完成附加文件，但流尚未完成）
    // close、end 或 finish 可能在调用此方法后立即触发，因此请提前向它们注册
    archive.finalize()
  }

  /**
   * 第二步: 将本地压缩包文件上传至远程服务器
   */
  private static uploadFile() {
    if (!this.params) return

    const {
      distPath,
      params: { host, username, password, pathUrl, port, distName, privateKeyPath }
    } = this

    let givenConfig = {}

    if (this.params?.password) {
      givenConfig = { host, username, password, port }
    } else {
      givenConfig = { host, username, privateKeyPath, port }
    }

    ssh
      .connect(givenConfig)
      .then(() => {
        // SSH 链接成功，将 dist 压缩包上传至远程服务器的指定地址
        ssh
          .putFile(`${distPath}.zip`, `${pathUrl}${sep}${distName}.zip`)
          .then(() => {
            log(chalk.bgGreen`上传成功\n`)

            this.updateFile()
          })
          .catch((err) => {
            log(chalk.red`上传失败: ${err}\n`)
            process.exit(0)
          })
      })
      .catch((err) => {
        log(chalk.red`SSH 链接失败: ${err}\n`)
        process.exit(0)
      })
  }

  /**
   * 第三步: 执行远程部署命令
   */
  private static updateFile() {
    if (!this.params?.pathUrl) return

    // ssh.execCommand 在指定文件夹下执行了命令 sh unzip.sh
    // unzip.sh 对上传的压缩包进行解压
    ssh.execCommand('sh unzip.sh', { cwd: this.params.pathUrl }).then((result) => {
      if (result.stderr) {
        log(chalk.red`\n服务端脚本执行错误\n${JSON.stringify(result)}\n`)
        process.exit(0)
      } else {
        log(chalk.bgGreen`服务端脚本执行成功\n`)
        process.exit(0)
      }
    })
  }
}

export default Load
