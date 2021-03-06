const async = require('async')
const Database = require('./database')
const Auth0 = require('./auth0')
const AWS = require('./aws')
const Server = require('./server')

class Api {
  constructor (config, logger) {
    this.config = config
    this.logger = logger.child({ context: 'Api' })
    this.isRunning = false
    this.database = new Database(this.config, this.logger)
    this.auth0 = new Auth0(config.auth0)
    this.aws = new AWS(this.config)
    this.server = new Server(this.config, this.logger, this.database, this.auth0, this.aws)
  }

  start (cb) {
    if (this.isRunning) {
      throw new Error('Cannot start Api because it is already running')
    }
    this.isRunning = true

    this.logger.verbose('Starting Api')
    async.parallel([
      cb => this.database.connect(cb),
      cb => this.server.listen(cb)
    ], (err) => {
      if (err) { return cb(err) }

      this.logger.verbose('Api ready and awaiting requests')
      cb(null, { port: this.config.server.port })
    })
  }

  stop (cb) {
    if (!this.isRunning) { throw new Error('Cannot stop Api because it is already stopping') }
    this.isRunning = false

    this.logger.verbose('Stopping Api')
    async.parallel([
      cb => this.database.disconnect(cb),
      cb => this.server.close(cb)
    ], (err) => {
      if (err) { return cb(err) }

      this.logger.verbose('Api has closed all connections and successfully halted')
      cb(null)
    })
  }
}

module.exports = Api
