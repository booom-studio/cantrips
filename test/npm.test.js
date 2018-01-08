/* eslint-env mocha */

const npm = require('../src/npm')
const tmp = require('tmp')
const fs = require('fs')
const path = require('path')
const expect = require('chai').expect

describe('createCredentials', () => {
  var tempDir = tmp.dirSync({unsafeCleanup: true})
  const authToken = 'authToken'
  before(() => {
    process.env.NPM_AUTH_TOKEN = authToken
  })

  after(() => {
    tempDir.removeCallback()
  })

  it('it uses values from the environment', async () => {
    await npm.createCredentials(null, null, tempDir.name)
    var configData = fs.readFileSync(path.join(tempDir.name, '.npmrc'), 'utf8')
    expect(configData).contain(`//registry.npmjs.org/:_authToken=${authToken}\n`)
  })

  it('creates npm user folder if does not exists', async () => {
    const innerPath = path.join(tempDir.name, 'inner')
    await npm.createCredentials(null, null, innerPath)
    var configData = fs.readFileSync(path.join(innerPath, '.npmrc'), 'utf8')
    expect(configData).not.to.equal(null)
  })

  it('uses provided values over the environment values', async () => {
    await npm.createCredentials('validRegistryURl', 'validAuthToken', tempDir.name)
    var configData = fs.readFileSync(path.join(tempDir.name, '.npmrc'), 'utf8')
    expect(configData).contain('//validRegistryURl:_authToken=validAuthToken\n')
  })
})
