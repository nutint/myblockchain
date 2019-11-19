const Transaction = require('./transaction')
const lodash = require('lodash')

class TransactionPool {
  constructor() {
    this.transactionMap = {}
  }

  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction
  }

  existingTransaction({ inputAddress }) {
    const transactions = Object.values(this.transactionMap)
    return transactions.find((t) => t.input.address === inputAddress)
  }

  setMap(transactionPoolMap) {
    this.transactionMap = transactionPoolMap
  }

  validTransactions() {
    return Object.values(this.transactionMap).filter(
      transaction => Transaction.validTransaction(transaction)
    )
  }

  clear() {
    this.transactionMap = {}
  }

  clearBlockchainTransactions({ chain }) {
    // console.log("chain = ", typeof(Object.values(chain)),  chain)
    // const transactionIds = Object.values(chain).flatMap(elem => elem.data.map(t => t.id))
    // this.transactionMap = lodash.omit(this.transactionMap, transactionIds)

    for (let i = 1; i < chain.length; ++i) {
      const block = chain[i]

      for (let transaction of block.data) {
        if(this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id]
        }
      }
    }
  }
}

module.exports = TransactionPool