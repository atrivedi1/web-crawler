'use strict'

const url_controller = require('./url_controller.js')

function router(app) {
  app.post("/urls", url_controller.crawl)
}

module.exports = router