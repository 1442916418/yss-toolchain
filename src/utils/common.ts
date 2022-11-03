import fs from 'fs'

/**
 * @name: 同步判断文件是否存在
 * @param {fs} dir 路径
 * @return {boolean}
 */
export const isFileExist = (dir: fs.PathLike) => {
  if (!dir) return false

  return fs.existsSync(dir)
}

/**
 * @name: 获取当前时间
 * @returns {string} YYYY-MM-DD HH:MM:SS
 */
export const formatDate = () => {
  const date = new Date()

  const year = date.getFullYear()
  let month: number | string = date.getMonth() + 1
  let weekday: number | string = date.getDate()
  let hour: number | string = date.getHours()
  let min: number | string = date.getMinutes()
  let sec: number | string = date.getSeconds()

  month = month < 10 ? '0' + month : month
  weekday = weekday < 10 ? '0' + weekday : weekday
  hour = hour < 10 ? '0' + hour : hour
  min = min < 10 ? '0' + min : min
  sec = sec < 10 ? '0' + sec : sec

  return year + '-' + month + '-' + weekday + ' ' + hour + ':' + min + ':' + sec
}

/**
 * @name: 更新版本号
 * @param {string} version 当前版本号
 * @param {number} type 1：累加操作
 * @param {number} number 1：累加值
 * @return {String} 新版本号
 */
export const updateVersionNumber = ({ version = '0.0.0', type = 1, number = 1 } = {}) => {
  if (!version) return

  const upperLimit = 10

  // majorVersionNumber：主要版本号，minorVersionNumber：子要版本号，revisionNumber：修订号
  let [majorVersionNumber = 0, minorVersionNumber = 0, revisionNumber = 0] = version.split('.').map(Number)

  revisionNumber += number

  if (revisionNumber >= upperLimit) {
    revisionNumber = 0
    minorVersionNumber += number
  }

  if (minorVersionNumber >= upperLimit) {
    minorVersionNumber = 0
    majorVersionNumber += number
  }

  if (majorVersionNumber >= upperLimit) {
    majorVersionNumber += number
  }

  return `${majorVersionNumber}.${minorVersionNumber}.${revisionNumber}`
}

/**
 * @name: 处理数据
 * @param {array} excludeKey 排除的 key
 * @return {string} data 数据
 */
export const getCircularReplacer = (excludeKey = []) => {
  const seen = new WeakSet()

  return (key: any, value: object | null) => {
    if (excludeKey) {
      // @ts-ignore
      if (excludeKey.includes(key)) return
    }

    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

/**
 * @name: 数据转成字符串
 * @return {string} data 数据
 */
export const handleDataToString = (data: any[], excludeKey = [], space = 2) => {
  return JSON.stringify(data, getCircularReplacer(excludeKey), space)
}

export default {
  isFileExist,
  formatDate,
  updateVersionNumber,
  getCircularReplacer,
  handleDataToString
}
