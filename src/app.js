#! /usr/bin/env node
'use strict'
import ElasticBeanstalk from './elasticBeanstalk'

import aws from './aws'
import npm from './npm'
import docker from './docker'
import pjson from '../package.json'
import logger from './logger'
import program from 'commander'

program
  .version(pjson.version)

program
  .command('aws_credentials')
  .option(' --accessKeyId [accessKeyId]', 'Which accessKeyId to use')
  .option(' --secretAccessKey [secretAccessKey]', 'Which secretAccessKey to use')
  .option(' --userFolder [userFolder]', 'Which userFolder to use')
  .action(async (options) => {
    await aws.createCredentials(options.accessKeyId, options.secretAccessKey, options.userFolder)
  })

program
  .command('docker')
  .action(async (options) => {
    await docker.buildImage()
    await docker.pushImage()
  })

program
  .command('npm credentials')
  .action(async (options) => {
    await npm.createCredentials()
  })

program
  .command('elasticBeanstalk deploy')
  .option(' --branchPattern [branchPattern]', 'Which accessKeyId to use')
  .action(async (options) => {
    await new ElasticBeanstalk().deploy(options.branchPattern)
  })

program.parse(process.argv)

if (!program.args.length) program.help()

process.on('uncaughtException', function (err) {
  logger.error('Uncaught Exception: \n', err)
})

process.on('unhandledRejection', function (reason, p) {
  logger.error('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason)
})
