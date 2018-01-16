'use strict'

import fs from 'fs'
import path from 'path'
import logger from './logger'

async function createCredentials (accessKeyId = null, secretAccessKey = null, userFolder = null) {
  logger.info(`Creating AWS credential file...`)
  accessKeyId = accessKeyId || process.env.AWS_ACCESS_KEY_ID
  secretAccessKey = secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
  userFolder = userFolder || '~/.aws'

  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder)
  }

  const config = `[profile eb-cli]\naws_access_key_id=${accessKeyId}\naws_secret_access_key=${secretAccessKey}\n`

  fs.writeFileSync(path.join(userFolder, 'config'), config, { mode: '600' })

  logger.info(`AWS credential file created: ${userFolder}/config`)
}

module.exports = {
  createCredentials: createCredentials
}
