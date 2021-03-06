/* eslint-env jest */

import { DockerHandler } from '../../src/docker/DockerHandler'
import { deleteFolderRecursive } from '../../src/utils/utils'

import path from 'path'
import { expect } from 'chai'
import childProcess from 'child_process'
import fs from 'fs'
import osTmpdir from 'os-tmpdir'

let tempDir = path.join(osTmpdir(), 'cantrips_test_dir')

function recreateGitRepository () {
  if (fs.existsSync(tempDir)) {
    deleteFolderRecursive(tempDir)
  }
  fs.mkdirSync(tempDir)
  childProcess.execSync(`cd ${tempDir} &&
    echo "from scratch \n COPY * /" >> Dockerfile`)
}

function getDockerImageList () {
  return childProcess.execSync('docker image ls --format "{{.Repository}}:{{.Tag}}"')
    .toString()
    .split('\n')
}

function snapShotDockerImages () {
  return childProcess.execSync('docker image ls --format "{{.ID}}"')
    .toString()
    .split('\n')
}

describe('docker', async () => {
  var alreadyPresentDockerImage
  var dockerHandler
  var validDockerImageName = 'my-test-org-my-test-image'
  var validDockerTarget = 'validDockerTarget'
  beforeAll(() => {
    process.env.CIRCLECI = 'CIRCLECI'
    process.env.CIRCLE_BRANCH = 'validBranchName'
    process.env.CIRCLE_PROJECT_USERNAME = 'validUser'
    process.env.CIRCLE_PROJECT_REPONAME = 'validRepoName'
    process.env.DOCKER_TARGET = validDockerTarget
    process.env.CIRCLE_TAG = ''
    process.env.CIRCLE_BRANCH = 'work/myBranch'
    process.env.DOCKER_USERNAME = 'validDockerUserFromEnv'
    process.env.DOCKER_PASSWORD = 'validDockerPasswordFromEnv'
    dockerHandler = new DockerHandler(tempDir)
    alreadyPresentDockerImage = snapShotDockerImages()
    jest.setTimeout(60000)
  })
  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      deleteFolderRecursive(tempDir)
    }
    var currentDockerImages = snapShotDockerImages()
    var imagesToRemove = currentDockerImages.filter(image => !alreadyPresentDockerImage.includes(image)).join(' ')
    childProcess.execSync(`docker rmi -f ${imagesToRemove}`)
  })
  beforeEach(() => {
    recreateGitRepository()
  })

  describe('buildImage', async () => {
    it('docker images can be built with image name parameter', async () => {
      await dockerHandler.buildImage(validDockerImageName)
      expect(getDockerImageList()).to.include(`${validDockerImageName}:latest`)
    })

    it('default docker image name is used on not setting it as parameter', async () => {
      await dockerHandler.buildImage()
      expect(getDockerImageList()).to.include('validuser-validreponame:latest')
    })

    it('docker images can be built with no caching', async () => {
      var dockerHandler = new DockerHandler(tempDir, (command) => command)
      var result = await dockerHandler.buildImage(null, true)
      expect(result).to.contain('--no-cache')
    })
  })
  describe('computeDefaultTags', () => {
    it('gives back normalized branch name in build mode', async () => {
      expect(await dockerHandler.computeDefaultTags()).to.include('work-mybranch')
    })
    it('gives back release version in release mode', async () => {
      process.env.CIRCLE_TAG = 'release-1.2.3'
      var dockerHandler = new DockerHandler(tempDir, (command) => command)
      process.env.CIRCLE_TAG = ''
      expect(await dockerHandler.computeDefaultTags()).to.include('1.2.3')
    })
  })

  describe('computeDefaultImageName', () => {
    it('computes correct image name', async () => {
      expect(await dockerHandler.computeDefaultImageName()).to.equal('validuser-validreponame')
    })
  })

  describe('login', () => {
    var validUser = 'validUser'
    var validPassword = 'validPassword'
    it('uses given username and password to authenticate', async () => {
      var dockerHandler = new DockerHandler(tempDir, (command) => command)
      var result = await dockerHandler.login(validUser, validPassword)
      expect(result).to.contain(`-u ${validUser} -p ${validPassword}`)
    })

    it('if parameters absent, uses environment defaults', async () => {
      var dockerHandler = new DockerHandler(tempDir, (command) => command)
      var result = await dockerHandler.login()
      expect(result).to.contain(`-u validDockerUserFromEnv -p validDockerPasswordFromEnv`)
    })
  })

  describe('tag', () => {
    it('tags an image with new tag...', async () => {
      var imageName = 'image-to-tag'
      var newTag = 'new-tag'
      await dockerHandler.buildImage(imageName)
      await dockerHandler.tagImage(imageName, 'latest', newTag)
      expect(getDockerImageList()).to.contain(`${imageName}:${newTag}`)
    })
  })
  describe('push', () => {
    var results = []
    var dockerHandler

    beforeAll(() => {
      dockerHandler = new DockerHandler(tempDir, (command) => results.push(command))
      dockerHandler.logger = {
        info: (msg) => {
          results.push(msg)
        }
      }
    })

    beforeEach(() => {
      results = []
    })

    it('uses the default values if parameters are not present', async () => {
      await dockerHandler.buildImage()
      await dockerHandler.pushImage()
      expect(results).to.include(`docker push ${validDockerTarget}/validuser-validreponame:work-mybranch`)
    })

    it('pushes latest as well if it is set', async () => {
      await dockerHandler.buildImage()
      await dockerHandler.pushImage(validDockerImageName, validDockerTarget, undefined, true)
      expect(results).to.include(`docker push ${validDockerTarget}/${validDockerImageName}:latest`)
    })

    it('pushes multiple times on multiple tags', async () => {
      await dockerHandler.buildImage()
      await dockerHandler.pushImage(validDockerImageName, validDockerTarget, ['a', 'b'], true)
      expect(results).to.include(`docker push ${validDockerTarget}/${validDockerImageName}:a`)
        .and.to.include(`docker push ${validDockerTarget}/${validDockerImageName}:b`)
    })
  })
})
