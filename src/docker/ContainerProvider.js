'use strict'

import { runCommand } from '../utils'

export default async (...args) => {
  const container = new Container(...args)
  await container.initializeContainer()
  return container
}

class Container {
  constructor (imageUrl, options) {
    this.imageUrl = imageUrl
    if (options) {
      this.volumes = options.volumes || []
    }
  }

  async initializeContainer (imageUrl) {
    await runCommand(`docker pull ${this.imageUrl}`)
  }

  async run (command) {
    return runCommand(`docker run \
      ${this.volumes ? '-v ' : ''}${this.volumes.join('-v ')} \
      ${this.imageUrl} \
      ${command}`)
  }
}
