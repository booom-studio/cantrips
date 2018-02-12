/* eslint-env jest */

import { expect } from 'chai'
import { normalizeString } from '../../src/utils/utils.js'

describe('utils', () => {
  describe('normalizeString', async () => {
    it('replaces all / with -', async () => {
      expect(normalizeString('test/string/with/forward/slashes')).to.be.eql('test-string-with-forward-slashes')
    })
    it('does not change input in other ways', async () => {
      expect('input_stringToNot:Change1').to.be.eql('input_stringToNot:Change1')
    })
  })
})
