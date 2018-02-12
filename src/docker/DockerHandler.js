'use strict'

import { ParameterProvider } from '../core/ParameterProvider'
import { normalizeString, isNormalizedString, runCommand } from '../utils/utils'
import logger from '../utils/Logger'

export class DockerHandler {
  constructor (location, commandRunner = undefined) {
    this.parameterProvider = new ParameterProvider()
    this.location = location
    this.runCommand = commandRunner || runCommand
  }

  async buildImage (imageName = undefined, noCache = true) {
    imageName = imageName || await this.computeDefaultImageName()
    return this.runCommand(`docker build ${noCache ? ' --no-cache' : ''} -t ${imageName} .`)
  }

  async pushImage (imageName = undefined, target = undefined, tags = undefined, latest = false) {
    imageName = imageName || await normalizeString(await this.computeDefaultImageName())
    target = target || await this.parameterProvider.getParameter('DockerTarget')
    tags = tags || await this.computeDefaultTags()

    if (!isNormalizedString(imageName)) {
      logger.error(`Image name ${imageName} is not a valid docker image name.`)
    }

    var fullPushTargetPath = (target) ? `${target}/${imageName}` : imageName

    if (latest) {
      logger.debug('Pushing latest image')
      await this.runCommand(`docker push ${fullPushTargetPath}:latest`)
    }
    for (const tag of tags) {
      if (!isNormalizedString(tag)) {
        logger.error(`Tag ${tag} is not a valid docker image name.`)
      }
      await this.tagImage(fullPushTargetPath, 'latest', tag)
      await this.runCommand(`docker push ${fullPushTargetPath}:${tag}`)
    }
  }

  async tagImage (imageToTag, oldTag, newTag) {
    logger.info(`Tagging image ${imageToTag} with tag ${newTag}`)
    return this.runCommand(`docker tag ${imageToTag}:${oldTag} ${imageToTag}:${newTag}`)
  }

  async login (username = undefined, password = undefined) {
    username = username || process.env.DOCKER_USERNAME
    password = password || process.env.DOCKER_PASSWORD
    return this.runCommand(`docker login -u ${username} -p ${password}`)
  }

  async computeDefaultTags () {
    return await this.parameterProvider.getParameter('IsRelease')
      ? [this.parameterProvider.getParameter('ReleaseVersion')]
      : [normalizeString(await this.parameterProvider.getParameter('BranchName'))]
  }

  async computeDefaultImageName () {
    return normalizeString(await this.parameterProvider.getParameter('ProjectName'))
  }
}
