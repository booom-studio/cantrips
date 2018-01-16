'use strict'

import fs from 'fs'
import path from 'path'
import logger from './logger'

async function createCredentials (registryUrl, authToken, userFolder = null) {
  logger.info(`Creating Npm credential file...`)
  authToken = authToken || process.env.NPM_AUTH_TOKEN
  if (!authToken) {
    throw new Error('NPM_AUTH_TOKEN is mandatory!')
  }
  registryUrl = registryUrl || process.env.NPM_REGISTRY_URL || 'registry.npmjs.org/'
  userFolder = userFolder || process.env.HOME

  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder)
  }

  const config = `//${registryUrl}:_authToken=${authToken}\n`
  const configFilePath = path.join(userFolder, '.npmrc')
  if (fs.existsSync(configFilePath)) {
    logger.warn(`Backing up existing npmrc ${configFilePath} as ${configFilePath}_old`)
    fs.renameSync(configFilePath, `${configFilePath}_old`)
  }

  fs.writeFileSync(configFilePath, config, { mode: '600' })

  logger.info(`Npm credential file created: ${configFilePath}`)
}

module.exports = {
  createCredentials: createCredentials
}
