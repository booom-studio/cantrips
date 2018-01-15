'use strict'

import logger from './logger'
import { ParameterProvider } from './parameterProvider'
import { runCommand } from './utils'

export default class ElasticBeanstalk {
  constructor (commandRunner = undefined) {
    this.parameterProvider = new ParameterProvider()
    this.runCommand = commandRunner || runCommand
  }
  // branchName:environmentName|branchName:environmentName
  async resolvePatternString (patternString) {
    return patternString.split('|').reduce((aggregated, pattern) => {
      const tokens = pattern.split(':')
      if (tokens.length === 2) {
        aggregated[tokens[0]] = tokens[1]
      } else {
        logger.warn(`Invalid pattern string fragment: '${pattern}'`)
      }
      return aggregated
    }, {})
  }

  async deploy (patternString = undefined, timeout = 60) {
    logger.info('Starting Elastic Beanstalk deployment')
    patternString = patternString || process.env.EB_DEPLOYMENT_PATTERN_STRING
    if (!patternString) {
      throw Error('EB_DEPLOYMENT_PATTERN_STRING variable is mandatory.')
    }
    const deploymentRules = await this.resolvePatternString(patternString)
    logger.debug(`Using rules:\n${JSON.stringify(deploymentRules, null, 2)}`)
    const branchName = await this.parameterProvider.getParameter('BranchName')
    if (!branchName) {
      throw Error('Cannot determine branch name!')
    }
    logger.debug(`Current branch name: ${branchName}`)
    const targetEnvironment = deploymentRules[branchName] || undefined
    if (!targetEnvironment) {
      throw Error(`No matching environment for branch ${branchName}`)
    }
    logger.debug(`Matching environment name: ${targetEnvironment}`)
    return this.runCommand(`eb deploy ${targetEnvironment} --timeout ${timeout}`)
  }
}
