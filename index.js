const express = require('express')
const Blockchain = require('./blockchain')

const app = express()
const blockchain = new Blockchain()

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain)
})

const port = 3000
app.listen(port, () => {
  console.log(`application has started at localhost:${port}`)
})