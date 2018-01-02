const { exec } = require('child_process');
const logger = require('./logger')

async function runCommand(command) {
  const childProcess = exec(command, (error, stdout, stderr) => {
    if (error) {
      logger.error(`exec error: ${error}`);
      return;
    }
  });
  childProcess.stdout.pipe(process.stdout)
  return new Promise((resolve, reject) => {
    childProcess.on('exit', () => {
      resolve(true)
    })
  })
}

async function buildImage(imageName = null, noCache = true) {
  imageName = imageName || computeDefaultImageName()
  return runCommand(`docker build ${noCache ? ' --no-cache' : ''} -t ${imageName} .`)
}


async function pushImage(imageName = null, target = null, tags = null, latest = false) {
  imageName = imageName || computeDefaultImageName()
  target = target || computeDefaultTarget()
  tags = tags || computeDefaultTags()
  if (latest) {
    await runCommand(`docker push ${target}:latest`)
  }
  for (const tag of tags) {
    await tagImage(imageName, tag)
    await runCommand(`docker push ${target}:${tag}`)
  }
}

async function tagImage(imageToTag, newTag) {
  logger.info(`Tagging image ${imageToTag} with tag ${newTag}`)
  return runCommand(`docker tag ${imageToTag} ${newTag}`)
}

async function login(username, password) {
  username = username || process.env.DOCKER_USERNAME
  password = password || process.env.DOCKER_PASSWORD
  return runCommand(`docker login -u ${username} -p ${password}`)
}

function computeDefaultTags() {
  return ['0.9.0']
}

function computeDefaultImageName() {
  return "booom/cantrips"
}

function computeDefaultTarget() {
  return "booom/cantrips"
}

module.exports = {
  buildImage: buildImage,
  pushImage: pushImage,
  login: login
}