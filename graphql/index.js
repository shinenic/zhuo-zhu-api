const { buildSchema } = require('graphql')
const { zhuoZhuData } = require('../asset/data')
const { selectCommonSongList } = require('../utils/data')
const { handleSearchWithCache } = require('../utils/dataWithCache')

const { songList } = zhuoZhuData
const sourceData = selectCommonSongList(songList)

const schema = buildSchema(`
  type Song {
    book: String,
    title: String,
    artist: String,
    volume: String,
    page: Int,
    totalPage: Int,
    note: String
  }

  type Pagination {
    totalPages: Int,
    pageSize: Int,
    totalCount: Int
  }

  type Songs {
    result: [Song],
    pagination: Pagination
  }

  type Query {
    songs(keyword: String, page: Int): Songs
  }
`)

const root = {
  songs: ({ keyword, page = 1 }) => {
    const result = handleSearchWithCache({ keyword, page }, sourceData)
    return result
  }
}

exports.root = root

exports.schema = schema
