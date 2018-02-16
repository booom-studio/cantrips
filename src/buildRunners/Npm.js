'use strict'

import fs from 'fs'
import path from 'path'
import logger from '../utils/Logger'
import ContainerProvider from '../docker/ContainerProvider'

export default async (options) => {
  const handler = new Npm(options)
  await handler.init()
  return handler
}

class Npm {
  constructor ({registryUrl, authToken, userFolder}) {
    this.authToken = authToken || process.env.NPM_AUTH_TOKEN
    if (!this.authToken) {
      throw new Error('NPM_AUTH_TOKEN is mandatory!')
    }
    this.registryUrl = registryUrl || process.env.NPM_REGISTRY_URL || 'registry.npmjs.org/'
    this.userFolder = userFolder || process.env.HOME

    this.imageUrl = 'node'
    this.container = undefined
  }

  async init () {
    this.container = await ContainerProvider(this.imageUrl)
  }

  async createCredentials () {
    logger.info(`Creating Npm credential file...`)

    if (!fs.existsSync(this.userFolder)) {
      fs.mkdirSync(this.userFolder)
    }

    const config = `//${this.registryUrl}:_authToken=${this.authToken}\n`
    const configFilePath = path.join(this.userFolder, '.npmrc')
    if (fs.existsSync(configFilePath)) {
      logger.warn(`Backing up existing npmrc ${configFilePath} as ${configFilePath}_old`)
      fs.renameSync(configFilePath, `${configFilePath}_old`)
    }

    fs.writeFileSync(configFilePath, config, { mode: '600' })

    logger.info(`Npm credential file created: ${configFilePath}`)
  }
}
