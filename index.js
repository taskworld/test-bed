#!/usr/bin/env node
'use strict'

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(express.static(__dirname + '/static'))
server.listen(9011, function () {
  console.log('')
  console.log('++====================================================++')
  console.log('|| test-bed is now running                            ||')
  console.log('||                                                    ||')
  console.log('|| Please open http://localhost:9011/ in your browser ||')
  console.log('|| in order to run tests.                             ||')
  console.log('++====================================================++')
  console.log('')
})
