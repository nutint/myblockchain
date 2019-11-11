const Block = require('./block')
const cryptoHash = require('./crypto-hash')

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()]
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length-1],
      data
    })

    this.chain.push(newBlock)
  }

  replaceChain(chain) {
    if(chain.length > this.chain.length && Blockchain.isValidChain(chain)) {
      console.log('Replacing chain')
      this.chain = chain
    } else {
      console.error('unable to replace chain')
    }
  }

  static isValidChain(chain) {
    const fn = (isValid, curr, index) => {
      if(index == 0) return JSON.stringify(curr) == JSON.stringify(Block.genesis())
      else {
        const prev = chain[index-1]
        const { timestamp, lastHash, hash, data } = curr

        return lastHash == prev.hash && cryptoHash(timestamp, lastHash, data) == hash && isValid
      }
    }
    return chain.reduce(fn, false)
  }
}

module.exports = Blockchain