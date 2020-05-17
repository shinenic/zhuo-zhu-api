
const path = require('path')
const { getFileDataSync } = require('../utils/base')

// Init essential data (maybe use xstate to judge state?)
const ASSET_PATH = path.join(__dirname)
const { songs: songList, books: bookList } = JSON.parse(getFileDataSync(`${ASSET_PATH}/zhuo-zhu-data.json`))

exports.zhuoZhuData = { songList, bookList }
