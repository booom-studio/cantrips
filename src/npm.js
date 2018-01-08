'use strict'

const fs = require('fs')
const path = require('path')
const logger = require('./logger')

async function createCredentials (registryUrl, authToken, userFolder = null) {
  logger.info(`Creating Npm credential file...`)
  authToken = authToken || process.env.NPM_AUTH_TOKEN
  registryUrl = registryUrl || process.env.NPM_REGISTRY_URL || 'registry.npmjs.org/'
  userFolder = userFolder || '~/'

  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder)
  }

  const config = `//${registryUrl}:_authToken=${authToken}\n`

  fs.writeFileSync(path.join(userFolder, '.npmrc'), config, { mode: '600' })

  logger.info(`Npm credential file created: ${userFolder}/.npmrc`)
}

module.exports = {
  createCredentials: createCredentials
}
