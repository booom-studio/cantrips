#! /usr/bin/env node
'use strict'
import ElasticBeanstalk from './elasticBeanstalk'

import aws from './aws'
import npm from './npm'
import S3Handler from './s3'
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
    await aws.createCredentials(options)
  })

program
  .command('docker')
  .action(async (options) => {
    await docker.buildImage()
    await docker.pushImage()
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
  .command('s3')
  .action(async (options) => {
    (await S3Handler()).listBucket()
  })

program
  .command('elasticBeanstalk deploy')
  .option(' --branchPattern [branchPattern]', 'Which accessKeyId to use')
  .option(' --accessKeyId [accessKeyId]', 'Which accessKeyId to use')
  .option(' --secretAccessKey [secretAccessKey]', 'Which secretAccessKey to use')
  .option(' --userFolder [userFolder]', 'Which userFolder to use')
  .action(async (options) => {
    await aws.createCredentials(options)
    await new ElasticBeanstalk(options).deploy(options.branchPattern)
  })

program.parse(process.argv)

if (!program.args.length) program.help()

process.on('uncaughtException', function (err) {
  logger.error('Uncaught Exception: \n', err)
})

process.on('unhandledRejection', function (reason, p) {
  logger.error('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason)
})
