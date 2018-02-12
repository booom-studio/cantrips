'use strict'

import fs from 'fs'
import path from 'path'
import logger from './utils/Logger'

async function createCredentials ({accessKeyId, secretAccessKey, userFolder}) {
  logger.info(`Creating AWS credential file...`)
  accessKeyId = accessKeyId || process.env.AWS_ACCESS_KEY_ID
  secretAccessKey = secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
  userFolder = userFolder || path.join(process.env.HOME, '.aws')

  if (!accessKeyId || !secretAccessKey) {
    throw Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment parameters are mandatory')
  }

  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder)
  }

  const config = `[profile eb-cli]\naws_access_key_id=${accessKeyId}\naws_secret_access_key=${secretAccessKey}\n`
  const configFilePath = path.join(userFolder, 'config')
  if (fs.existsSync(configFilePath)) {
    logger.warn(`Backing up existing npmrc ${configFilePath} as ${configFilePath}_old`)
    fs.renameSync(configFilePath, `${configFilePath}_old`)
  }

  fs.writeFileSync(configFilePath, config, { mode: '600' })

  logger.info(`AWS credential file created: ${userFolder}/config`)
}

module.exports = {
  createCredentials: createCredentials
}
