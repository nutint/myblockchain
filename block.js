class Block {
  constructor({ timestamp, lastHash, hash, data }) {
    this.timestamp = timestamp
    this.hastHash = lastHash
    this.hash = hash
    this.data = data
  }
}

const block1 = new Block({
  timestamp: '01/01/01',
  lastHash: 'foo-lastHash',
  hash: 'foo-hash',
  data:  'foo-data'
})

console.log(block1)