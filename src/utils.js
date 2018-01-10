'use strict'

import fs from 'fs'
import { exec } from 'child_process'
import logger from './logger'

function normalizeString (string) {
  return string.split('/').join('-').toLowerCase()
}

function isNormalizedString (string) {
  return !string.includes('/') && string === string.toLowerCase()
}

function deleteFolderRecursive (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

async function runCommand (command) {
  logger.debug(`Running command: ${command}`)
  const childProcess = exec(command, {cwd: this.location}, (error, stdout, stderr) => {
    if (error) {
      logger.error(`exec error: ${error}`)
    }
  })
  childProcess.stdout.pipe(process.stdout)
  return new Promise((resolve, reject) => {
    childProcess.on('exit', () => {
      resolve(true)
    })
  })
}

module.exports = {
  normalizeString: normalizeString,
  deleteFolderRecursive: deleteFolderRecursive,
  runCommand: runCommand,
  isNormalizedString: isNormalizedString
}
