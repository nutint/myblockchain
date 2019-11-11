const { GENESIS_DATA, MINE_RATE } = require('./config')
const cryptoHash = require('./crypto-hash')

class Block {
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    this.timestamp = timestamp
    this.lastHash = lastHash
    this.hash = hash
    this.data = data
    this.nonce = nonce
    this.difficulty = difficulty
  }

  static genesis() {
    return new Block(GENESIS_DATA)
  }

  static mineBlock({ lastBlock, data }) {
    const lastHash = lastBlock.hash
    const { difficulty } = lastBlock
    let nonce = 0, hash, timestamp

    do {
      nonce++
      timestamp = Date.now()
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty)
    } while(hash.substring(0, difficulty) !== '0'.repeat(difficulty))

    return new this({
      timestamp,
      lastHash,
      data,
      difficulty,
      nonce,
      hash
    })
  }

  static adjustDifficulty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock
    return (timestamp - originalBlock.timestamp) > MINE_RATE ? difficulty - 1 : difficulty + 1
  }
}

module.exports = Block