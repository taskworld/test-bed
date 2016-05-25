#!/usr/bin/env node
'use strict'

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(express.static(__dirname + '/static'))
server.listen(9011, function () {
  console.log('Listen: ', this.address())
})
