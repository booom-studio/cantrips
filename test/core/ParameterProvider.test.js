/* eslint-env jest */
import { ParameterProvider } from '../../src/core/ParameterProvider'

import { expect } from 'chai'

describe('parameterProvider', () => {
  var provider
  beforeAll(() => {
    process.env.CIRCLECI = 'CIRCLECI'
    process.env.CIRCLE_BRANCH = 'validBranchName'
    process.env.CIRCLE_PROJECT_USERNAME = 'validUser'
    process.env.CIRCLE_PROJECT_REPONAME = 'validRepoName'
    provider = new ParameterProvider()
  })
  describe('environments', () => {
    describe('CircleCI', () => {
      it('resolves variables', async () => {
        expect(await provider.getParameter('BranchName')).to.be.eql('validBranchName')
      })
      it('constructs derived values', async () => {
        expect(await provider.getParameter('ProjectName')).to.be.eql('validUser/validRepoName')
      })
    })
  })
  describe('getParameter', () => {
    it('throws error on asking for not existing parameter', async () => {
      expect(() => provider.getParameter('notExistingParameter')).to.throw(Error)
        .that.ownProperty('message').which.includes('Unknown parameter')
    })
  })
})
