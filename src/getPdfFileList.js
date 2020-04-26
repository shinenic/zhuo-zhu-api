const fs = require('fs')
const { isPDFfile, numberWithCommas, getFileSizeText, mapArrObjToArr, pickObjKeysInArray } = require('../utils/base')

const getLastIndexValue = fileList => {
  const length = fileList.length
  if (length === 0) return -1
  return fileList[length - 1].index
}

const walkSync = (dir, _fileList) => {
  let fileList = _fileList || []
  const files = fs.readdirSync(dir)
  files.forEach(file => {
    if (fs.statSync(`${dir}/${file}`).isDirectory()) {
      filelist = walkSync(`${dir}/${file}/`, fileList)
    }
    else if (isPDFfile(file)) {
      const filePath = dir + file
      const fileSize = fs.statSync(filePath).size
      fileList.push({
        index: getLastIndexValue(fileList) + 1,
        name: file.replace(/(\.pdf|_XXX)/g, ''),
        locatedFolder: filePath.split('/')[filePath.split('/').length - 2],
        path: filePath,
        size: `${numberWithCommas(getFileSizeText(fileSize))} KB`
      })
    }
  })
  return fileList
}

exports.walkSync = walkSync

exports.getPdfFileList = (path) => walkSync(path)
