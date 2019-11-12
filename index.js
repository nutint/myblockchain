const express = require('express')
const Blockchain = require('./blockchain')
const bodyParser = require('body-parser')
const PubSub = require('./pubsub')

const app = express()
const blockchain = new Blockchain()
const pubsub = new PubSub({blockchain})

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

const DEFAULT_PORT=3000
const port = process.env.GENERATE_PEER_PORT === 'true' ? DEFAULT_PORT + Math.ceil(Math.random() * 1000) : DEFAULT_PORT

app.listen(port, () => {
  console.log(`application has started at localhost:${port}`)
})