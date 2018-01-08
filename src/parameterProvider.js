'use strict'

function determineCiServer () {
  if (process.env.CIRCLECI) {
    return 'CircleCi'
  }
  throw Error('Unknown CI server environment')
}

export class ParameterProvider {
  constructor () {
    this.ciServer = determineCiServer()

    this.parameterMap = {
      DockerTarget: {
        CircleCi: ''
      },
      Tag: {
        CircleCi: process.env.CIRCLE_TAG || ''
      },
      ReleaseTagFormat: {
        CircleCi: process.env.RELEASE_TAG_FORMAT || 'release-'
      },
      ReleaseVersion: {
        CircleCi: process.env.RELEASE_VERSION || '1.2.3'
      },
      BranchName: {
        CircleCi: process.env.CIRCLE_BRANCH || ''
      }
    }
    this.computeDerivedParamters()
  }

  computeDerivedParamters () {
    this.parameterMap = Object.assign({}, this.parameterMap, {
      IsRelease: {
        CircleCi: this.getParameter('Tag') && this.getParameter('Tag').startsWith(this.getParameter('ReleaseTagFormat'))
      },
      ProjectName: {
        CircleCi: () => {
          const result = `${process.env.CIRCLE_PROJECT_USERNAME || ''}/${process.env.CIRCLE_PROJECT_REPONAME || ''}`
          return result !== '/' ? result : 'unknown'
        }
      }
    })
  }

  getParameter (parameter) {
    if (!Object.keys(this.parameterMap).includes(parameter)) {
      throw Error(`Unknown parameter: ${parameter}`)
    }
    const result = this.parameterMap[parameter][this.ciServer]
    if (typeof (result) === 'function') {
      return result()
    }
    return result
  }
}
