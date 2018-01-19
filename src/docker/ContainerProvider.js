'use strict'

import { runCommand } from '../utils'

export default async (imageUrl) => {
  const container = new Container(imageUrl)
  await container.initializeContainer()
  return container
}

class Container {
  constructor (imageUrl) {
    this.imageUrl = imageUrl
  }

  async initializeContainer (imageUrl) {
    await runCommand(`docker pull ${this.imageUrl}`)
  }

  async run (command) {
    return runCommand(`docker run ${this.imageUrl} ${command}`)
  }
}
