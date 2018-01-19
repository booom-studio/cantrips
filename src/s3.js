'use strict'

import ContainerProvider from './docker/ContainerProvider'

export default async (...args) => {
  const handler = new S3Handler(args)
  await handler.init()
  return handler
}

class S3Handler {
  constructor () {
    this.imageUrl = 'garland/aws-cli-docker'
    this.container = undefined
  }

  async init () {
    this.container = await ContainerProvider(this.imageUrl)
  }

  async listBucket (bucketName) {
    await this.container.run(`echo 'almafa'`)
  }
}
