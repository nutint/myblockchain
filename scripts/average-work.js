const Blockchain = require('../blockchain')

const blockchain = new Blockchain()

blockchain.addBlock({data: 'fooData'})

console.log('first block', blockchain.chain[blockchain.chain.length-1])

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = []

for (let i=0; i<=10000; i++) {
  prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp
  blockchain.addBlock({ data: `block ${i}`})

  nextBlock = blockchain.chain[blockchain.chain.length - 1]
  nextTimestamp = nextBlock.timestamp
  timeDiff = nextTimestamp = nextTimestamp - prevTimestamp
  times.push(timeDiff)

  average = times.reduce((total, number) => { return total + number})/times.length

  console.log(`Time to mine block: ${timeDiff}ms. Difficulty ${nextBlock.difficulty} Average Time: ${average}.ms`)
}