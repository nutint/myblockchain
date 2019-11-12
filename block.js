const { GENESIS_DATA, MINE_RATE } = require('./config')
const cryptoHash = require('./crypto-hash')
const hexToBinary = require('hex-to-binary')

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
    let nonce = 0, hash, timestamp, difficulty

    do {
      nonce++
      timestamp = Date.now()
      difficulty = Block.adjustDifficulty({originalBlock: lastBlock, timestamp})
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty)
    } while(hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty))

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
    if(difficulty <= 0) return 1
    return (timestamp - originalBlock.timestamp) > MINE_RATE ? difficulty - 1 : difficulty + 1
  }
}

module.exports = Block