import React from 'react'
import { fancyTimeFormat } from './utils/time'

const MediaInfo = ({
  currentTime,
  duration,
  bpm,
  loopTime,
  size
}) => (
  <div className="player__media-info">
    <div className="player__media-info--line">
      <div className="player__media-info--currentTime">{currentTime}</div>
      <div className="player__media-info--duration">{duration}</div>
    </div>
    <div className="player__media-info--line">
      <div className="player__media-info--bpm">BPM: {bpm} | Size: {size} | LoopTime: {fancyTimeFormat(loopTime || 0)}</div>
    </div>
  </div>
)

export default MediaInfo