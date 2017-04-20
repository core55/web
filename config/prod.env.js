var merge = require('webpack-merge')
var dotenv = require('./dotenv')

module.exports = merge(dotenv, {
  NODE_ENV: '"production"'
})