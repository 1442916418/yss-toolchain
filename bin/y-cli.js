#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')

program
  .command('build-log')
  .description('Create packaging log.')
  .option('-b, --branch <value>', 'Git branch list.', collect, ['master'])
  .option('-a, --author <value>', 'Git or project author list.', collect, ['yushuisheng'])
  .option('-e, --environment <value>', 'Project packaging environment.', 'development')
  .option('-s, --environmentSuffix <value>', 'Project packaging environment suffix.', 'dev')
  .option('-p, --project <value>', 'Multi application project name.', 'null')
  .action((params) => {
    handleBuildLog(params)
  })

program
  .command('upload')
  .description('Upload and update the server software package.')
  .option('-e, --environment <value>', 'Project packaging environment.', 'development')
  .option('-d, --directory <value>', 'Project Packaging Directory.', 'dist')
  .action((params) => {
    handleUploadCommand(params)
  })

// 输出未知命令的帮助信息
program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`y-cli <command> --help`)} for detailed usage of given command.`)
  console.log()
})

program.commands.forEach((c) => c.on('--help', () => console.log()))

program.parse(process.argv)

function collect(value, previous) {
  return [value].concat(previous)
}

function handleBuildLog(params) {
  try {
    const dist = require('../dist')

    dist.BuildLog.init({
      branchList: params.branch,
      authorList: params.author,
      environment: params.environment,
      environmentSuffix: params.environmentSuffix,
      project: params.project
    })
  } catch (error) {
    throw new Error('handleBuildLog error:\n', error)
  }
}

function handleUploadCommand(params) {
  try {
    const dist = require('../dist')

    dist.Upload.init({
      environment: params.environment,
      distName: params.directory
    })
  } catch (error) {
    throw new Error(`\nhandleUploadCommand error:${error}`)
  }
}
