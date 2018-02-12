'use strict'

import ContainerProvider from './docker/ContainerProvider'
import logger from './utils/Logger'

export default async (options) => {
  const handler = new S3Handler(options)
  await handler.init()
  return handler
}

class S3Handler {
  constructor ({accessKeyId, secretAccessKey}, runCommand) {
    this.imageUrl = 'garland/aws-cli-docker'
    this.container = undefined
    this.accessKeyId = accessKeyId || process.env.AWS_ACCESS_KEY_ID
    this.secretAccessKey = secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
    if (!this.accessKeyId || !this.secretAccessKey) {
      throw Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment parameters are mandatory')
    }
  }

  async init () {
    this.container = await ContainerProvider(this.imageUrl)
    this.container.addEnvironmentVariable('AWS_ACCESS_KEY_ID', this.accessKeyId)
    this.container.addEnvironmentVariable('AWS_SECRET_ACCESS_KEY', this.secretAccessKey)
  }

  async listBucket (bucketName) {
    await this.container.run(`aws s3 ls ${bucketName}`)
  }

  async get (fileUri, targetPath) {
    if (!fileUri.startsWith('s3://')) {
      throw Error('First parameter must start with "s3://"')
    }
    if (!targetPath) {
      targetPath = `./${fileUri.split('/').slice(-1).pop()}`
    }
    logger.info(`Downloading file from ${fileUri} to ${targetPath}`)
    await this.container.run(`aws s3 cp ${fileUri} ${targetPath}`)
  }
}
