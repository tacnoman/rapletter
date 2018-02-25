import React, { Component } from 'react'
import PropType from 'prop-types'
import detect from 'bpm-detective'
import { Icon } from 'react-fa'
import { fancyTimeFormat } from './utils/time'
import MediaInfo from './MediaInfo'
import MediaControl from './MediaControl'
import getGlobal from './utils/getGlobal'
import { addCuePoint, setMediaInfo } from './store/actions'

import './PlayerAudio.css'

// const WaveSurfer = require('wavesurfer.js')

const idGenerator = function*() {
  let id = 0
  while(true)
    yield ++id
}

const getId = idGenerator()

class PlayerAudio extends Component {
  state = {
    shouldRender: false
  }

  constructor(props) {
    super(props)
    this.wavesurfer = {}
  }

  setNewSong = (ev) => {
    /** Getting BPM */
    var fileReader  = new FileReader();
    const dispatch = this.context.store.dispatch

    fileReader.onload = function() {
      var arrayBuffer = this.result;
      const size = (arrayBuffer.byteLength / 1024 / 1024).toFixed(2).toString().replace('.', ',') + 'MB'

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      let context = new AudioContext();

      new Promise((resolve, reject) => {
        context.decodeAudioData(arrayBuffer, resolve, reject)
      }).then(buffer => {
        try {
          const bpm = detect(buffer);
          const loopTime = 60*8/bpm
          dispatch(setMediaInfo({ bpm, loopTime, size }))
        } catch (err) {
          console.error(err);
        }
      })
    }

    this.context.store.dispatch(setMediaInfo({ title: ev.target.value.split(/(\\|\/)/g).pop() }))

    fileReader.readAsArrayBuffer(ev.target.files[0]);
    var url = URL.createObjectURL(ev.target.files[0]);
    this.wavesurfer.load(url)
  }

  setNewSongUsingUrl = (ev) => {
    const url = ev.target.value
    const { dispatch } = this.context.store

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let context = new AudioContext();

    fetch(url)
      // Get response as ArrayBuffer
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        // Decode audio into an AudioBuffer
        new Promise((resolve, reject) => {
          context.decodeAudioData(arrayBuffer, resolve, reject)
        }).then(buffer => {
        try {
          const size = (arrayBuffer.byteLength / 1024 / 1024).toFixed(2).toString().replace('.', ',') + 'MB'
          const bpm = detect(buffer);
          const loopTime = 60*8/bpm
          dispatch(setMediaInfo({ bpm, loopTime, size }))
        } catch (err) {
          console.error(err);
        }
      })
    })

    this.wavesurfer.load(url)
  }

  componentDidMount() {
    if(typeof window === 'undefined') return

    this.setState({ shouldRender: true })

    getGlobal('WaveSurfer').then((WaveSurfer) => {
      this.wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple',
        splitChannels: true,
        height: 64,
        barWidth: 0
      })

      const dispatch = this.context.store.dispatch

      this.wavesurfer.on('play', () => {
        dispatch(setMediaInfo({ isPlaying: true }))
      })

      this.wavesurfer.on('pause', () => {
        dispatch(setMediaInfo({ isPlaying: false }))
      })

      this.wavesurfer.on('stop', () => {
        dispatch(setMediaInfo({ isPlaying: false }))
      })

      this.wavesurfer.on('ready', () => {
        this.wavesurfer.play();

        const duration = this.wavesurfer.getDuration()
        this.context.store.dispatch(setMediaInfo({ duration: fancyTimeFormat(duration) }))
      });

      setInterval(this.runEvents, 100)
    })
  }

  runEvents = () => {
    const newTime = fancyTimeFormat(this.wavesurfer.getCurrentTime())
    if(newTime !== this.state.currentTime) {
      this.setState({ currentTime: newTime })
    }

    // loop
    if (this.context.store.getState().mediaControl.loopActive) {
      this.context.store.getState().cuePoints.forEach((loop) => {
        const difference = this.wavesurfer.getCurrentTime() - loop.end
        if(difference > -0.05 && difference < 1) {
          const seekTo = (loop.start + difference) / this.wavesurfer.getDuration()
          this.wavesurfer.seekTo(seekTo)
        }
      })
    }
  }

  setLoop = () => {
    const currentTime = this.wavesurfer.getCurrentTime()

    const cuePoint = {
      id: getId.next().value,
      start: currentTime,
      end: currentTime + this.context.store.getState().mediaInfo.loopTime
    }

    this.context.store.dispatch(addCuePoint(cuePoint))
  }

  render() {
    if(!this.state.shouldRender) return <div><Icon spin name="spinner fa-4x" /></div>

    const {
      currentTime,
    } = this.state

    const {
      mediaInfo
    } = this.context.store.getState()

    return (
      <div className="player">
        <div className="player__title">{mediaInfo.title}</div>
        <div className="player__wave" id="waveform"></div>

        <MediaInfo
          currentTime={currentTime}
        />

        <MediaControl
          setLoop={this.setLoop.bind(this)}
          wavesurfer={this.wavesurfer}
        />

        <input type="file" id="mediaFile" onChange={this.setNewSong} />
        <input type="text" id="mediaFileUrl" onBlur={this.setNewSongUsingUrl} />
        <span>https://wavesurfer-js.org/example/media/demo.wav</span>
      </div>
    );
  }
}

PlayerAudio.contextTypes = {
  store: PropType.object
}

export default PlayerAudio
