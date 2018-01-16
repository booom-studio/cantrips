/* eslint-env jest */

import ElasticBeanstalk from '../src/elasticBeanstalk'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

describe('elasticBeanstalk', () => {
  var elasticBeanstalk
  var messages = []
  var defaultTimeout = 60

  var validBranch = 'branchName'
  var validEnvironment = 'environmentName'
  var otherValidBranch = 'branchName1'
  var otherValidEnvironment = 'environmentName1'

  var simpleBranchPattern = `${validBranch}:${validEnvironment}`
  var multiBranchPattern = `${validBranch}:${validEnvironment}|${otherValidBranch}:${otherValidEnvironment}`
  var invalidBranchPattern = 'notExistingBranch:notExistingEnvironment'

  beforeAll(() => {
    process.env.CIRCLECI = 'CIRCLECI'
    process.env.CIRCLE_BRANCH = otherValidBranch
    elasticBeanstalk = new ElasticBeanstalk((command) => messages.push(command))
  })
  beforeEach(() => {
    messages = []
  })
  describe('resolvePatternString', () => {
    var invalidPatternStrings = ['', 'not valid pattern string']
    it('resolves multiple pattern string correctly', async () => {
      expect(await elasticBeanstalk
        .resolvePatternString(multiBranchPattern))
        .to.eql({
          [validBranch]: validEnvironment,
          [otherValidBranch]: otherValidEnvironment
        })
    })
    it('resolves simple pattern string correctly', async () => {
      expect(await elasticBeanstalk
        .resolvePatternString(simpleBranchPattern))
        .to.eql({
          [validBranch]: validEnvironment
        })
    })
    invalidPatternStrings.forEach(async (patternString) => {
      it(`generates 0 roles on invalid pattern string: '${patternString}'`, async () => {
        expect(await elasticBeanstalk
          .resolvePatternString(patternString))
          .to.eql({})
      })
    })
  })
  describe('deploy', () => {
    it('runs correct command on given branch ', async () => {
      await elasticBeanstalk.deploy(multiBranchPattern)
      expect(messages)
        .to.contain(`eb deploy ${otherValidEnvironment} --timeout ${defaultTimeout}`)
    })
    it('throws error if there is not matching environment for the current branch', async () => {
      expect(elasticBeanstalk.deploy(invalidBranchPattern))
        .to.be.rejectedWith(Error, /No matching environment/)
    })
  })
})
