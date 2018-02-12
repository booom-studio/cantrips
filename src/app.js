#! /usr/bin/env node
'use strict'
import ElasticBeanstalk from './ElasticBeanstalk'
import { DockerHandler } from './docker/DockerHandler'
import S3Handler from './S3Handler'

import aws from './aws'
import npm from './npm'
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
    await aws.createCredentials(options)
  })

program
  .command('docker')
  .option(' --skipPush', 'Skip push of created image')
  .action(async (options) => {
    const handler = new DockerHandler()
    await handler.buildImage()
    if (!options.skipPush) {
      await handler.pushImage()
    } else {
      logger.info('Image push skipped')
    }
  })

program
  .command('npm credentials')
  .option(' --registryUrl [registryUrl]', 'Which registry to use')
  .option(' --authToken [authToken]', 'What auth token to use')
  .option(' --userFolder [userFolder]', 'Which userFolder to use')
  .action(async (options) => {
    await npm.createCredentials(options)
  })

program
  .command('s3 <subCommand> [commandParameter1] [commandParameter2]')
  .option(' --accessKeyId [accessKeyId]', 'Which accessKeyId to use')
  .option(' --secretAccessKey [secretAccessKey]', 'Which secretAccessKey to use')
  .action(async (subCommand, commandParameter1, commandParameter2, options) => {
    const handler = await S3Handler(options)
    switch (subCommand) {
      case 'ls':
        handler.listBucket(commandParameter1)
        return
      case 'get':
        handler.get(commandParameter1, commandParameter2)
    }
  })

program
  .command('elasticBeanstalk')
  .option(' --branchPattern [branchPattern]', 'Which accessKeyId to use')
  .option(' --accessKeyId [accessKeyId]', 'Which accessKeyId to use')
  .option(' --secretAccessKey [secretAccessKey]', 'Which secretAccessKey to use')
  .option(' --userFolder [userFolder]', 'Which userFolder to use')
  .action(async (options) => {
    // await aws.createCredentials(options)

    (await ElasticBeanstalk(options)).deploy(options.branchPattern)
  })

program.parse(process.argv)

if (!program.args.length) program.help()

process.on('uncaughtException', function (err) {
  logger.error('Uncaught Exception: \n', err)
  process.exit(-1)
})

process.on('unhandledRejection', function (reason, p) {
  logger.error('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason)
  process.exit(-1)
})
