exports.selectCommonSongList = (songList) => {
  return songList.filter(obj =>
    obj.book === '永難忘懷情歌集(旋律版)(簡譜)'
    || (obj.book === '最新排行(簡譜)' && Number(obj.volume) <= 104))
}
