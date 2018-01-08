'use strict'

function normalizeString (name) {
  return name.split('/').join('-')
}

module.exports = {
  normalizeString: normalizeString
}
