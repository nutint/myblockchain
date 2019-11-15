const Block = require('./block')
const { cryptoHash } = require('../util')
const { REWARD_INPUT, MINING_REWARD } = require('../config')
const Transaction = require('../wallet/transaction')

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

  replaceChain(chain, onSuccess) {
    if(chain.length > this.chain.length && Blockchain.isValidChain(chain)) {
      console.log('Replacing chain')
      if(onSuccess) onSuccess()
      this.chain = chain
    } else {
      console.error('unable to replace chain')
    }
  }

  validTransactionData({ chain }) {
    for(let i=1; i<chain.length; ++i) {
      let rewardTransactionCount = 0
      const block = chain[i]

      for(let transaction of block.data) {
        if(transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount += 1
          if(rewardTransactionCount > 1) {
            console.error('Miner rewards exceed limit')
            return false
          }

          if(Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error('Miner reward amount is invalid')
            return false
          }
        } else {
          if(!Transaction.validTransaction(transaction)) {
            console.error("Invalid transaction")
            return false
          }
        }
      }
    }
    return true
  }

  static isValidChain(chain) {
    const fn = (isValid, curr, index) => {
      if(index == 0) return JSON.stringify(curr) == JSON.stringify(Block.genesis())
      else {
        const prev = chain[index-1]
        const { timestamp, lastHash, hash, data, nonce, difficulty } = curr
        const jumpedDifficulty = Math.abs(difficulty - prev.difficulty) > 1

        return lastHash == prev.hash && cryptoHash(timestamp, lastHash, data, nonce, difficulty) == hash && isValid && !jumpedDifficulty
      }
    }
    return chain.reduce(fn, false)
  }
}

module.exports = Blockchain