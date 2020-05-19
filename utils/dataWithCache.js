const nodeCache = require("node-cache")
const dataCache = new nodeCache({ stdTTL: 600 })
const matchSorter = require('match-sorter').default

const DEFAULT_HITS_COUNT = 15

const getDataFromCache = (keyword) => {
  return dataCache.get(keyword)
}

const createDataWithPagination = (keyword, result, hits) => {
  const totalPages = Math.ceil(result.length / hits)
  const pageData = Array.from({ length: totalPages }).reduce((acc) => {
    const currentPage = Object.keys(acc).length + 1
    return {
      ...acc,
      [currentPage]: result.slice((currentPage - 1) * hits, currentPage * hits)
    }
  }, {})
  return {
    keyword,
    pageData,
    pagination: {
      totalPages,
      pageSize: hits,
      totalCount: result.length
    }
  }
}

exports.handleSearchWithCache = (query = {}, sourceData, hits = DEFAULT_HITS_COUNT) => {
  const { keyword, page } = query
  const data = getDataFromCache(keyword, page, page)
  if (data) {
    return {
      result: data.pageData[page],
      pagination: Object.assign({}, data.pagination, { currentPage: page })
    }
  }

  const result = matchSorter(sourceData, keyword, { keys: ['title', 'artist', 'volume'] })
  const cacheData = createDataWithPagination(keyword, result, hits)
  const isSuccess = dataCache.set(keyword, cacheData)
  if (!isSuccess) console.log('Cache error')
  return {
    result: cacheData.pageData[page],
    pagination: Object.assign({}, cacheData.pagination, { currentPage: page })
  }
}
