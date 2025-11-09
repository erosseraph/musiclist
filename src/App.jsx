
import React, { useState, useEffect } from 'react'

export default function App() {
  const [artists, setArtists] = useState([])
  const [songs, setSongs] = useState([])
  const [playlist, setPlaylist] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [view, setView] = useState('artists')
  const [selectedArtist, setSelectedArtist] = useState(null)

  // 搜索歌手
  useEffect(() => {
    fetch('https://itunes.apple.com/search?term=pop&entity=musicArtist&limit=20')
      .then(res => res.json())
      .then(data => setArtists(data.results || []))
  }, [])

  const searchSongs = async (term) => {
    if (!term) return
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=25`)
    const data = await res.json()
    setSongs(data.results || [])
    setView('songs')
  }

  const openArtist = async (artistName) => {
    setSelectedArtist(artistName)
    await searchSongs(artistName)
  }

  const addToPlaylist = (song) => {
    if (!playlist.find(s => s.trackId === song.trackId)) {
      setPlaylist([...playlist, song])
    }
  }

  const removeFromPlaylist = (id) => {
    setPlaylist(playlist.filter(s => s.trackId !== id))
  }

  const moveSong = (index, direction) => {
    const newList = [...playlist]
    const target = index + direction
    if (target < 0 || target >= newList.length) return
    const temp = newList[index]
    newList[index] = newList[target]
    newList[target] = temp
    setPlaylist(newList)
  }

  return (
    <div className="container">
      <h1>蓝白 · 你的专属歌单中心 🎧</h1>

      <div className="search-bar">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索歌手或歌曲..."
        />
        <button onClick={() => searchSongs(searchTerm)}>搜索</button>
      </div>

      {view === 'artists' && (
        <div className="artist-list">
          {artists.map((a) => (
            <div key={a.artistId} className="card" onClick={() => openArtist(a.artistName)}>
              <img src={a.artworkUrl100 || 'https://via.placeholder.com/100'} alt={a.artistName} />
              <p>{a.artistName}</p>
            </div>
          ))}
        </div>
      )}

      {view === 'songs' && (
        <div>
          <button onClick={() => setView('artists')}>← 返回歌手列表</button>
          <h2>{selectedArtist ? selectedArtist + ' 的歌曲' : '搜索结果'}</h2>
          <div className="song-list">
            {songs.map((s) => (
              <div key={s.trackId} className="song-card">
                <img src={s.artworkUrl100} alt={s.trackName} />
                <div>
                  <p><b>{s.trackName}</b></p>
                  <p>{s.artistName}</p>
                </div>
                <button onClick={() => addToPlaylist(s)}>＋加入歌单</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="playlist">
        <h2>🎵 我的歌单</h2>
        {playlist.length === 0 && <p>暂无歌曲，快添加喜欢的吧！</p>}
        {playlist.map((s, i) => (
          <div key={s.trackId} className="playlist-item">
            <span>{i + 1}. {s.trackName} - {s.artistName}</span>
            <div>
              <button onClick={() => moveSong(i, -1)}>↑</button>
              <button onClick={() => moveSong(i, 1)}>↓</button>
              <button onClick={() => removeFromPlaylist(s.trackId)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
