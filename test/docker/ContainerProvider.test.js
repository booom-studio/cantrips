/* eslint-env jest */

import ContainerProvider, {Container} from '../../src/docker/ContainerProvider'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

var validImageUrl = 'alpine'
var validPropertyName = 'validPropertyName'
var validPropertyValue = 'validPropertyValue'
var validPropertyKeyValue = {[validPropertyName]: validPropertyValue}

describe('ContainerProvider', () => {
  var containerProvider
  beforeAll(async () => {
    jest.setTimeout(60000)
    containerProvider = await ContainerProvider(validImageUrl, {environment: validPropertyKeyValue})
  })
  it('creates container', async () => {
    expect(containerProvider.imageUrl).to.equal(validImageUrl)
  })

  it('passes args to container', async () => {
    expect(containerProvider.environment).to.contain(validPropertyKeyValue)
  })
})

describe('Container', () => {
  var container
  var messages = []
  var validCommand = 'echo "thing"'

  beforeAll(async () => {
    jest.setTimeout(20000)
    container = new Container(validImageUrl, {environment: {'testName': 'testValue'}, volumes: ['test:path']})
  })
  beforeEach(() => {
    messages = []
  })
  describe('construction', () => {
    it('picks environment', async () => {
      expect(container.environment)
        .to.contain({'testName': 'testValue'})
    })
    it('picks volumes', async () => {
      expect(container.volumes)
        .to.contain('test:path')
    })
  })
  describe('addEnvironmentVariable', () => {
    it('registers variable in container environment', async () => {
      container.addEnvironmentVariable('testVariableName', 'testVariableValue')
      expect(container.environment.testVariableName)
        .to.eql('testVariableValue')
    })
  })

  describe('run', () => {
    var container
    beforeAll(async () => {
      container = new Container(validImageUrl, {environment: {'testName': 'testValue'}, volumes: ['test:path']}, (command) => { messages.push(command) })
    })
    it('uses environment variables in the run command', async () => {
      await container.run(validCommand)
      expect(messages[0])
        .to.contain(`-e testName=testValue`)
    })

    it('uses volumes in the run command', async () => {
      await container.run(validCommand)
      expect(messages[0])
        .to.contain(`-v test:path`)
    })

    it('runs given command', async () => {
      await container.run(validCommand)
      expect(messages[0])
        .to.contain(validCommand)
    })
  })
})
