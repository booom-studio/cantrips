#! /usr/bin/env node
'use strict'

const aws = require('./aws')
const docker = require('./docker')
const pjson = require('../package.json')

const program = require('commander')

program
  .version(pjson.version)

program
  .command('aws_credentials')
  .option(' --accessKeyId [accessKeyId]', 'Which accessKeyId to use')
  .option(' --secretAccessKey [secretAccessKey]', 'Which secretAccessKey to use')
  .option(' --userFolder [userFolder]', 'Which userFolder to use')
  .action((options) => {
    aws.createCredentials(options.accessKeyId, options.secretAccessKey, options.userFolder)
  })

program
  .command('docker')
  .action(async (options) => {
    await docker.buildImage()
    await docker.pushImage()
  })

program.parse(process.argv)

if (!program.args.length) program.help()

process.on('uncaughtException', function (err) {
  console.log('Uncaught Exception: \n', err)
})

process.on('unhandledRejection', function (reason, p) {
  console.log('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason)
})
