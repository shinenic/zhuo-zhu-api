const express = require("express")
const http = require('http')
const app = express()
const logfmt = require("logfmt")
const path = require('path')
const cors = require('cors')
const fs = require('fs')
const matchSorter = require('match-sorter').default
const socket = require('socket.io')
const chokidar = require('chokidar')

const graphqlHTTP = require('express-graphql')
const { root, schema } = require('./graphql/index')

const { isDevMode, getNowTime, pickObjKeysInArray } = require('./utils/base')
const { selectCommonSongList } = require('./utils/data')
const { zhuoZhuData } = require('./asset/data')
const { getPdfFileList } = require('./src/getPdfFileList')
const { SOCKET_EVENT } = require('./constants/index')


// Config
app.use(cors())
const PORT = 5566
let nodeAPIMode
const latestFile = { index: -1, timeStamp: 0 }

const { songList,  bookList } = zhuoZhuData

// Init File list data
const PDF_FOLDER_PATH = path.join(__dirname, 'pdfs/')
let fileList = getPdfFileList(PDF_FOLDER_PATH)
let fileListForClient = pickObjKeysInArray(fileList, ['index', 'name', 'locatedFolder'])

// Log
app.use(logfmt.requestLogger())

// Enable parse json body
app.use(express.json())

// Graphql
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}))

// Database route
if (isDevMode()) {
  app.use(cors())
  nodeAPIMode = 'DEV'
} else {
  app.use('/api', require('./router/db'))
  nodeAPIMode = 'PROD'
}

app.get('/api', (req, res) => {
  res.send('API for song search')
})

app.get('/api/pdffile', (req, res) => {
  const path = fileList[req.query.index].path
  const file = fs.readFileSync(path)
  res.contentType("application/pdf")
  res.send(file)
})

app.get('/api/booklist', (req, res) => {
  res.json(bookList)
})

app.get('/api/filelist', (req, res) => {
  res.json(fileListForClient)
})

app.get('/api/songlist', (req, res) => {
  const source = req.query.mode !== 'ALL'
    ? selectCommonSongList(songList)
    : songList

  res.json(pickObjKeysInArray(source, ['title', 'artist', 'volume', 'page']))
})

app.get('/api/songs', (req, res) => {
  const source = req.query.mode !== 'ALL'
    ? selectCommonSongList(songList)
    : songList

  const result = req.query.k
    ? matchSorter(source, req.query.k, { keys: ['title', 'artist', 'volume'] })
    : []

  res.json(pickObjKeysInArray(result, ['title', 'artist', 'volume', 'page']))
})

// Watch pdf file folder
chokidar.watch(PDF_FOLDER_PATH).on('all', (event, path) => {
  fileList = getPdfFileList(PDF_FOLDER_PATH)
  fileListForClient = pickObjKeysInArray(fileList, ['index', 'name', 'locatedFolder'])
});

const port = Number(process.env.PORT || PORT)
const server = http.Server(app).listen(port, () => {
  console.log(`Listening on port ${port}, "${nodeAPIMode}" mode`)
})

// Socket
const io = socket(server)

io.on('connection', socket => {
  socket.on('viewerStatus', status => {
    const { VIEWER_STATUS } = SOCKET_EVENT
    switch (status) {
      case VIEWER_STATUS.PDF_LOAD_SUCCESS:
        socket.broadcast.emit('viewerStatus', VIEWER_STATUS.PDF_LOAD_SUCCESS)
        break
    }
  })
  socket.on('fileIndex', message => {
    // message = { action, index }
    const { FILE_INDEX } = SOCKET_EVENT
    switch (message.action) {
      case FILE_INDEX.SET_FILE_INDEX:
        Object.assign(
          latestFile,
          { index: message.index, timeStamp: getNowTime() }
        )
        io.sockets.emit('fileIndex', latestFile)
        break
      case FILE_INDEX.GET_FILE:
        io.sockets.emit('fileIndex', latestFile)
        break
    }
  })
  socket.on('pageActions', action => {
    const { PAGE_ACTIONS } = SOCKET_EVENT
    switch (action) {
      case PAGE_ACTIONS.SET_NEXT_PAGE:
        socket.broadcast.emit('pageActions', PAGE_ACTIONS.SET_NEXT_PAGE)
        break
      case PAGE_ACTIONS.SET_PREV_PAGE:
        socket.broadcast.emit('pageActions', PAGE_ACTIONS.SET_PREV_PAGE)
        break
    }
  })
})
