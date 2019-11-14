const express = require('express')
const request = require('request')
const Blockchain = require('./blockchain')
const bodyParser = require('body-parser')
const PubSub = require('./app/pubsub')
const TransactionPool = require('./wallet/transaction-pool')
const Wallet = require('./wallet')

const app = express()
const blockchain = new Blockchain()
const transactionPool = new TransactionPool()
const wallet = new Wallet()
const pubsub = new PubSub({blockchain})

const DEFAULT_PORT=3000
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

setTimeout(() => pubsub.broadcastChain(), 1000)

app.use(bodyParser.json())

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain)
})

app.post('/api/mine', (req, res) => {
  const { data } = req.body
  blockchain.addBlock({data})
  pubsub.broadcastChain()
  res.redirect('/api/blocks')
})

app.post('/api/transact', (req, res) => {
  const { amount, recipient } = req.body
  const transaction = wallet.createTransaction({ recipient, amount })

  transactionPool.setTransaction(transaction)
  console.log('transactionPool', transactionPool)

  res.json({ transaction })
})

const syncChains = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
    if(!error && response.statusCode === 200) {
      const rootChain = JSON.stringify(body)
      console.log("replace chain on a sync with", rootChain)
      blockchain.replaceChain(rootChain)
    }
  })
}

const port = process.env.GENERATE_PEER_PORT === 'true' ? DEFAULT_PORT + Math.ceil(Math.random() * 1000) : DEFAULT_PORT

app.listen(port, () => {
  console.log(`application has started at localhost:${port}`)

  if(port !== DEFAULT_PORT) {
    syncChains()
  }
})