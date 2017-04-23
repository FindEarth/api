const fs = require('fs')
const nowConfig = require('./now.json')

nowConfig.alias = process.env.ALIAS || 'api.find.earth'
fs.writeFileSync('now.json', JSON.stringify(nowConfig, null, 2), 'utf8')
