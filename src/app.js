const aws = require('./aws')
const pjson = require('../package.json')

const program = require('commander')

program
  .version(pjson.version)

program
  .command('aws_credentials')
  .option(' --accessKeyId [accessKeyId]', 'Which accessKeyId to use')
  .option(' --secretAccessKey [secretAccessKey]', 'Which secretAccessKey to use')
  .option(' --userFolder [userFolder]', 'Which userFolder to use')
  .action((options) => {
    aws.createCredentials(options.accessKeyId, options.secretAccessKey, options.userFolder)
  })

program.parse(process.argv)

if (!program.args.length) program.help();