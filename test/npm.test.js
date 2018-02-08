/* eslint-env jest */

import npm from '../src/npm'
import tmp from 'tmp'
import fs from 'fs'
import path from 'path'
import { expect } from 'chai'

describe('createCredentials', () => {
  var tempDir = tmp.dirSync({unsafeCleanup: true})
  const authToken = 'authToken'
  beforeAll(() => {
    process.env.NPM_AUTH_TOKEN = authToken
  })

  afterAll(() => {
    tempDir.removeCallback()
  })

  it('it uses values from the environment', async () => {
    await npm.createCredentials({userFolder: tempDir.name})
    var configData = fs.readFileSync(path.join(tempDir.name, '.npmrc'), 'utf8')
    expect(configData).contain(`//registry.npmjs.org/:_authToken=${authToken}\n`)
  })

  it('creates npm user folder if does not exists', async () => {
    const innerPath = path.join(tempDir.name, 'inner')
    await npm.createCredentials({userFolder: innerPath})
    var configData = fs.readFileSync(path.join(innerPath, '.npmrc'), 'utf8')
    expect(configData).not.to.equal(null)
  })

  it('uses provided values over the environment values', async () => {
    await npm.createCredentials({registryUrl: 'validRegistryURl', authToken: 'validAuthToken', userFolder: tempDir.name})
    var configData = fs.readFileSync(path.join(tempDir.name, '.npmrc'), 'utf8')
    expect(configData).contain('//validRegistryURl:_authToken=validAuthToken\n')
  })
})
