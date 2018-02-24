import React from 'react'
import { Icon } from 'react-fa'
import PlayPause from './button/PlayPause'
import { fancyTimeFormat } from './utils/time'

const MediaControl = ({
  isPlaying,
  loopActive,
  wavesurfer,
  loops,
  setLoop,
  togleLoop
}) => (
  <React.Fragment>
    <div className="player__media-control">
      <PlayPause isPlaying={isPlaying} onClick={() => wavesurfer.playPause()} />
      <button onClick={() => wavesurfer.stop()}><Icon name="stop" /></button>
      <button onClick={() => togleLoop()} style={{ background: loopActive ? 'rgba(0, 255, 0, 0.6)' : null }}>
        <Icon name="toggle-on" />
      </button>
      <button onClick={() => setLoop()}><Icon name="retweet" /></button>
    </div>
    <div className="">
      <input type="range" min="1" max="200" defaultValue="1" style={{ width: '100%' }} onInput={(ev) => {
        var zoomLevel = Number(ev.target.value)
        wavesurfer.zoom(zoomLevel)
      }} />
    </div>

    {loops.map((loop) => (
      <div key={loop.id}>
        <input type="text" readOnly value={fancyTimeFormat(loop.start || 0)} />
        <input type="text" readOnly value={fancyTimeFormat(loop.end || 0)} />
      </div>
    ))}
  </React.Fragment>
)

export default MediaControl