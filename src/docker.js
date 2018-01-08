'use strict'

import parameterProvider from './parameterProvider'

const { exec } = require('child_process')
const logger = require('./logger')
const path = require('path')

const { normalizeString } = require('./utils')

async function runCommand (command) {
  logger.debug(`Running command: ${command}`)
  const childProcess = exec(command, (error, stdout, stderr) => {
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

async function buildImage (imageName = null, noCache = true) {
  imageName = imageName || await computeDefaultImageName()
  return runCommand(`docker build ${noCache ? ' --no-cache' : ''} -t ${imageName} .`)
}

async function pushImage (imageName = null, target = null, tags = null, latest = false) {
  imageName = imageName || await computeDefaultImageName()
  target = target || await computeDefaultTarget()
  tags = tags || await computeDefaultTags()
  if (!tags) {
    logger.info('No tags to push!')
  }
  if (latest) {
    logger.debug('Pushing latest image')
    await runCommand(`docker push ${target}:latest`)
  }
  for (const tag of tags) {
    await tagImage(imageName, tag)
    await runCommand(`docker push ${target}:${tag}`)
  }
}

async function tagImage (imageToTag, newTag) {
  logger.info(`Tagging image ${imageToTag} with tag ${newTag}`)
  return runCommand(`docker tag ${imageToTag} ${newTag}`)
}

async function login (username, password) {
  username = username || process.env.DOCKER_USERNAME
  password = password || process.env.DOCKER_PASSWORD
  return runCommand(`docker login -u ${username} -p ${password}`)
}

async function computeDefaultTags () {
  return await parameterProvider.getParameter('IsRelease') ? parameterProvider.getParameter('ReleaseVersion') : normalizeString(await parameterProvider.getParameter('BranchName'))
}

async function computeDefaultImageName () {
  return normalizeString(await parameterProvider.getParameter('ProjectName'))
}

async function computeDefaultTarget () {
  return path.join(await parameterProvider.getParameter('DockerTarget'), await computeDefaultImageName())
}

module.exports = {
  buildImage: buildImage,
  pushImage: pushImage,
  login: login
}
