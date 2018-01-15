/* eslint-env jest */

const { ElasticBeanstalk } = require('../src/elasticBeanstalk')

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const expect = chai.expect
chai.should()
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
      elasticBeanstalk.deploy(invalidBranchPattern).should.be.rejectedWith(Error)
    })
  })
})
