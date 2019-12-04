const express = require('express')
const request = require('request')
const path = require('path')
const Blockchain = require('./blockchain')
const bodyParser = require('body-parser')
const PubSub = require('./app/pubsub')
const TransactionPool = require('./wallet/transaction-pool')
const Wallet = require('./wallet')
const TransactionMiner = require('./app/transaction-miner')
const lodash = require('lodash')

const isDevelopment = process.env.ENV === 'development'

const DEFAULT_PORT=3000
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`
const REDIS_URL = isDevelopment ?
  'redis://127.0.0.1:6379' :
  'redis://h:pad21cbc10a1c4f9b820cca1ea94e523575acda54cfe65d1a203edf121ad38944@ec2-52-205-156-44.compute-1.amazonaws.com:14449'

const app = express()
const blockchain = new Blockchain()
const transactionPool = new TransactionPool()
const wallet = new Wallet()
const pubsub = new PubSub({blockchain, transactionPool, redisUrl: REDIS_URL})
const transactionMiner = new TransactionMiner({
  blockchain,
  transactionPool,
  wallet,
  pubsub
})

setTimeout(() => pubsub.broadcastChain(), 1000)

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'client/dist')))

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain)
})

app.post('/api/mine', (req, res) => {
  const { data } = req.body
  blockchain.addBlock({data})
  pubsub.broadcastChain()
  res.redirect('/api/blocks')
})

app.get('/api/wallet-info', (req, res) => {
  const address = wallet.publicKey
  res.json({ 
    address,
    balance: Wallet.calculateBalance({ chain: blockchain.chain, address })
  })
})

app.post('/api/transact', (req, res) => {
  const { amount, recipient } = req.body

  try {
    const existingTransaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey })
    if(existingTransaction) {
      existingTransaction.update({ senderWallet: wallet, recipient, amount })
      transactionPool.setTransaction(existingTransaction)

      pubsub.broadcastTransaction(existingTransaction)
      return res.json({ type: 'success', existingTransaction })
    } else {
      const transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain })
      transactionPool.setTransaction(transaction)

      pubsub.broadcastTransaction(transaction)
      return res.json({ type: 'success', transaction })
    }
  } catch (error) {
    return res.status(400).json({ type: 'error', message: error.message })
  }
})

app.get('/api/transaction-pool-map', (req, res) => {
  res.json(transactionPool.transactionMap)
})

app.get('/api/mine-transaction', (req, res) => {
  transactionMiner.mineTransactions()
  res.redirect('/api/blocks')
})

const syncWithRootState = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
    if(!error && response.statusCode === 200) {
      const rootChain = JSON.stringify(body)
      console.log("replace chain on a sync with", rootChain)
      blockchain.replaceChain(rootChain, true)
    }
  })

  request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
    if(!error && response.statusCode === 200) {
      const rootTransactionMap = JSON.parse(body)
      console.log('replace transaction pool map on a sync with', rootTransactionMap)
      transactionPool.setMap(rootTransactionMap)
    }
  })
}

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'))
})

if(isDevelopment) {
  const walletFoo = new Wallet()
  const walletBar = new Wallet()

  const generateWalletTransaction = ({ wallet, recipient, amount }) => {
    const transaction = wallet.createTransaction({
      recipient,
      amount,
      chain: blockchain.chain
    })

    transactionPool.setTransaction(transaction)
  }

  const walletAction = () => generateWalletTransaction({
    wallet, recipient: walletFoo.publicKey, amount: 5
  })

  const walletFooAction = () => generateWalletTransaction({
    wallet: walletFoo, recipient: walletBar.publicKey, amount: 10
  })

  const walletBarAction = () => generateWalletTransaction({
    wallet: walletBar, recipient: wallet.publicKey, amount: 15
  })

  lodash.range(10)
    .forEach(elem => {
      if(elem % 3 == 0) {
        walletAction()
        walletFooAction()
      } else if (elem % 3 == 1) {
        walletAction()
        walletBarAction()
      } else {
        walletFooAction()
        walletBarAction()
      }

      transactionMiner.mineTransactions()
    })
}

const generatedPort = process.env.GENERATE_PEER_PORT === 'true' ? DEFAULT_PORT + Math.ceil(Math.random() * 1000) : DEFAULT_PORT
const PORT = process.env.PORT || generatedPort

app.listen(PORT, () => {
  console.log(`application has started at localhost:${port}`)

  if(port !== DEFAULT_PORT) {
    syncWithRootState()
    
  }
})