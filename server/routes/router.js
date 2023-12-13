const express = require('express')
const route = express.Router()
const controller = require('../controller/controller')

// API routes 
route.post('/contacts', controller.create)
route.get('/contacts', controller.read)
route.put('/contacts/:id', controller.update)
route.delete('/contacts/:id', controller.delete)
route.get('/contacts/search', controller.search)

// search 
route.get('/api/contacts/search', controller.search)

module.exports = route