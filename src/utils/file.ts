import fs from 'fs'
import nodePath from 'path'

import { isFileExist, handleDataToString } from './common'

/**
 * @name: 写入文件
 * @param {string} path 路径
 * @param {string} content 数据
 */
export const handleWriteFile = ({ path = '', content = '' } = {}) => {
  if (!path) {
    throw new Error('handleWriteFile 请传入路径')
  }

  let fileDir: string[] | string = path.split(nodePath.sep).slice(0, -1)

  fileDir = nodePath.join(...fileDir)

  if (fileDir && !isFileExist(fileDir)) {
    fs.mkdirSync(fileDir)
  }

  fs.writeFile(
    path,
    content,
    {
      encoding: 'utf8'
    },
    (err) => {
      if (err) {
        console.error(err)
        return
      }
      console.log(`${path} => 文件写入成功`)
    }
  )
}

/**
 * @name: 文件覆盖写入
 * @description: 文件存在则追加写入，否则直接写入
 * @param {string} filePath 文件路径
 * @param {string} content 追加内容
 * @param {string} type arrayJson：JSON 数组格式，json：JSON 格式，string：文本
 */
export const handleOverwriteWriteFile = (
  filePath: string,
  content: string | { [x: string]: any },
  type = 'arrayJson'
) => {
  if (!filePath) {
    throw new Error('请传入文件路径')
  }

  if (!content) {
    throw new Error('请传入写入内容')
  }

  const splitFilePath = filePath.split(nodePath.sep)
  const newFilePath = nodePath.join(...splitFilePath)

  if (isFileExist(newFilePath)) {
    fs.open(newFilePath, 'r', (err, fd) => {
      if (err) {
        throw err
      }

      const data = fs.readFileSync(newFilePath, {
        encoding: 'utf8'
      })

      let result: any = ''

      if (type === 'arrayJson') {
        if (data) {
          result = JSON.parse(data)

          result.unshift(content)
        } else {
          result = [content]
        }
        handleWriteFile({ path: newFilePath, content: handleDataToString(result) })
      } else if (type === 'json') {
        if (data) {
          result = JSON.parse(data)

          result = Object.assign(result, content)
        } else {
          result = content
        }
        handleWriteFile({ path: newFilePath, content: handleDataToString(result) })
      } else if (type === 'string') {
        result = data ? `${content}\n${data}` : content

        handleWriteFile({ path: newFilePath, content: result })
      }
    })
  } else {
    handleWriteFile({ path: newFilePath, content: handleDataToString([content]) })
  }
}

/**
 * 读取路径里的所有文件
 * @param filePath 路径
 */
export const handleFileDisplay = (filePath: string, deep = 1) => {
  const allFiles: any[] = []

  const fileDisplay = (path: string) => {
    const files = fs.readdirSync(path)

    files.forEach(async (file) => {
      const dir = nodePath.join(filePath, file)

      if (fs.statSync(dir).isDirectory()) {
        allFiles.push({
          type: 1,
          name: dir
        })
        fileDisplay(dir)
      } else {
        allFiles.push({
          type: 2,
          name: dir
        })
      }
    })
  }

  fileDisplay(filePath)

  return allFiles
}

export default {
  handleWriteFile,
  handleOverwriteWriteFile,
  handleFileDisplay
}
