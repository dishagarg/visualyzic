/* eslint-disable */
// Assumes context is an AudioContext defined outside of this class.

var beatCutOff = 0;
var beatTime = 0;
var msecsAvg = 640;
var bpmTime = 0;
var ratedBPMTime = 550;
var bpmStart = Date.now();

class VSpectrogramCore extends Polymer.Element {
  static get is() {return 'v-spectrogram-core';}

  static get properties() {
    return {
      // Show the controls UI.
      controls: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
          value: false,
      },
      controlLabel: {
          type: String,
          notify: true,
          reflectToAttribute: true,
          value: 'Open Controls',
      },
      songPlay: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
          value: false,
      },
      songPlayLabel: {
          type: String,
          notify: true,
          reflectToAttribute: true,
          value: 'Open Play Panel',
      },
      // Log mode.
      log: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
          observer: '_logChanged',
          value: false,
      },
        labels: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
          observer: '_labelsChanged',
          value: false,
      },
        ticks: {
          type: Number,
          notify: true,
          reflectToAttribute: true,
          observer: '_ticksChanged',
          value: 5,
      },
      // FFT bin size,
      fftsize: {
          type: Number,
          notify: true,
          reflectToAttribute: true,
          value: 2048,
      },
      oscillator: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
          value: false,
      },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.tempCanvas = document.createElement('canvas'),
    console.log('Created spectrogram');
    // Get input from the microphone.
    if (navigator.mozGetUserMedia) {
      // callbacks defined with the media function.
      navigator.mozGetUserMedia({audio: true},
                                this.onStream.bind(this),
                                this.onStreamError.bind(this));
    } else if (navigator.webkitGetUserMedia) {
      navigator.webkitGetUserMedia({audio: true},
                                this.onStream.bind(this),
                                this.onStreamError.bind(this));
    }
    this.ctx = this.$.canvas.getContext('2d');
  }
  _controlEvent() {
      if (this.controlLabel=='Open Controls') {
        this.controls = true;
        this.controlLabel = 'Close Controls';
      } else {
        this.controls = false;
        this.controlLabel = 'Open Controls';
      }
  }
  _songPlayEvent() {
      if (this.songPlayLabel=='Open Play Panel') {
        this.songPlay = true;
        this.songPlayLabel = 'Close Play Panel';
      } else {
        this.songPlay = false;
        this.songPlayLabel = 'Open Play Panel';
      }
  }

  render() {
    console.log('Render');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    var didResize = false;
    // Ensure dimensions are accurate.
    if (this.$.canvas.width != this.width) {
      this.$.canvas.width = this.width;
      this.$.labels.width = this.width;
      didResize = true;
    }
    if (this.$.canvas.height != this.height) {
      this.$.canvas.height = this.height;
      this.$.labels.height = this.height;
      didResize = true;
    }
    //console.log(this.t_domain);

    if (this.t_domain==='time') {
        this.renderTimeDomain();
    }
      else if (this.t_domain==='animation') {
        this.renderAnimationScene();
    } else {
        this.renderFreqDomain();
    }

    if (this.labels && didResize) {
      // change the axeslabels if resize did happen and labels are true
      this.renderAxesLabels();
    }

    requestAnimationFrame(this.render.bind(this));

    var now = new Date();
    if (this.lastRenderTime_) {
      this.instantaneousFPS = now - this.lastRenderTime_;
    }
    this.lastRenderTime_ = now;
  }

  renderTimeDomain() {
    console.log('renderTimeDomain');
    var times = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(times);

    for (var i = 0; i < times.length; i++) {
      var value = times[i];
      var percent = value / 256;
      var barHeight = this.height * percent;
      var offset = this.height - barHeight - 1;
      var barWidth = this.width/times.length;
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(i * barWidth, offset, 1, 1);
    }
  }
    
  renderAnimationScene() {
    //console.log('renderAnimationScene');
    
    // init options
    this.volSens = this.volSens || 1;
    this.beatHoldTime = this.beatHoldTime || 45;
    this.beatDecayRate = this.beatDecayRate || .9;
    this.beatMin = this.beatMin || .2;
    this.levelsCount = this.levelsCount || 16;
      
    this.freqArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.dataArray = new Float32Array(this.analyser.fftSize);
    this.analyser.getByteFrequencyData(this.freqArray);
    this.analyser.getByteTimeDomainData(this.timeArray);
    this.analyser.getFloatTimeDomainData(this.dataArray);
    this.bufferLength = this.analyser.frequencyBinCount;
      
    
    this.waveform = this.getNormalizedWaveform();  // used for the plane geometry in scene
    this.levels = this.getNormalizedLevels();   // used for nothing but volume
    this.volume = this.getAverageVolumeLevel();   // used for the ball in scene
    this.isBeat = this.getBeatTime();  // used to change the color of the ball on every beat
    //console.log('waveform: ', this.waveform);
    //console.log('isBeat: ', this.isBeat);
  }

  getBeatTime() {
    if (this.volume > beatCutOff && this.volume > this.beatMin) {
      beatCutOff = this.volume * 1.1;
      beatTime = 0;
    } else {
      if (beatTime <= this.beatHoldTime) {
        beatTime++;
      } else {
        beatCutOff *= this.beatDecayRate;
        beatCutOff = Math.max(beatCutOff, this.beatMin);
      }
    }

    bpmTime = (Date.now() - bpmStart) / msecsAvg;

    return beatTime < 6;
  }

  getNormalizedWaveform() {
    return _.times(this.bufferLength, function(i){
      return ((this.timeArray[i] - 128) / 128) * this.volSens;
    }.bind(this));
  }

  getNormalizedLevels() {
    var bufferLength = this.bufferLength;   // frquencyBinCount = 128
    var levelBins = Math.floor(bufferLength / this.levelsCount);  // levelsCount = 16
    return _.times(this.levelsCount, (function(i){
      var sum = 0;
      _.times(levelBins, (function(j){
        sum += this.freqArray[(i * levelBins) + j];
      }).bind(this));
      return sum / levelBins / 256 * this.volSens;
    }).bind(this));
  }

  getAverageVolumeLevel() {
    var sum = 0;
    _.times(this.levelsCount, (function(i){
      sum += this.levels[i];
    }).bind(this));
    return sum / this.levelsCount;
  }
    
  renderFreqDomain() {
    console.log('renderFreqDomain');
    var freq = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(freq);

    var ctx = this.ctx;
    // Copy the current canvas onto the temp canvas.
    this.tempCanvas.width = this.width;
    this.tempCanvas.height = this.height;
    // console.log(this.$.canvas.height, this.tempCanvas.height);
    var tempCtx = this.tempCanvas.getContext('2d');
    tempCtx.drawImage(this.$.canvas, 0, 0, this.width, this.height);

    // Iterate over the frequencies.
    for (var i = 0; i < freq.length; i++) {
      var value;
      // Draw each pixel with the specific color.
      if (this.log) {
        var logIndex = this.logScale(i, freq.length);
        value = freq[logIndex];
      } else {
        value = freq[i];
      }
      ctx.fillStyle = (this.color ? this.getFullColor(value) :
                       this.getGrayColor(value));

      var percent = i / freq.length;
      var y = Math.round(percent * this.height);

      // draw the line at the right side of the canvas
      ctx.fillRect(this.width - this.speed, this.height - y,
                   this.speed, this.speed);
    }

    // Translate the canvas. to have scrolling effect <--
    ctx.translate(-this.speed, 0);
    // Draw the copied image.
    ctx.drawImage(this.tempCanvas, 0, 0, this.width, this.height,
                  0, 0, this.width, this.height);
    // Reset the transformation matrix.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /**
   * Given an index and the total number of entries, return the
   * log-scaled value.
   */
  logScale(index, total, optBase) {
    var base = optBase || 2;
    var logmax = this.logBase(total + 1, base);
    var exp = logmax * index / total;
    return Math.round(Math.pow(base, exp) - 1);
  }

  logBase(val, base) {
    return Math.log(val) / Math.log(base);
  }

  renderAxesLabels() {
    var canvas = this.$.labels;
    canvas.width = this.width;
    canvas.height = this.height;
    var ctx = canvas.getContext('2d');
    var startFreq = 440;
    var nyquist = context.sampleRate/2;
    var endFreq = nyquist - startFreq;
    var step = (endFreq - startFreq) / this.ticks;
    var yLabelOffset = 5;
    // Render the vertical frequency axis.
    for (var i = 0; i <= this.ticks; i++) {
      var freq = startFreq + (step * i);
      // Get the y coordinate from the current label.
      var index = this.freqToIndex(freq);
      var percent = index / this.getFFTBinCount();
      var y = (1-percent) * this.height;
      var x = this.width - 60;
      // Get the value for the current y coordinate.
      var label;
      if (this.log) {
        // Handle a logarithmic scale.
        var logIndex = this.logScale(index, this.getFFTBinCount());
        // Never show 0 Hz.
        freq = Math.max(1, this.indexToFreq(logIndex));
      }
      label = this.formatFreq(freq);
      var units = this.formatUnits(freq);
      ctx.font = '16px Inconsolata';
      // Draw the value.
      ctx.textAlign = 'right';
      ctx.fillText(label, x, y + yLabelOffset);
      // Draw the units.
      ctx.textAlign = 'left';
      ctx.fillText(units, x + 10, y + yLabelOffset);
      // Draw a tick mark.
      ctx.fillRect(x + 40, y, 30, 2);
        console.log('axes');
    }
  }

  clearAxesLabels() {
    var canvas = this.$.labels;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, this.width, this.height);
  }

  formatFreq(freq) {
    return (freq >= 1000 ? (freq/1000).toFixed(1) : Math.round(freq));
  }

  formatUnits(freq) {
    return (freq >= 1000 ? 'KHz' : 'Hz');
  }

  indexToFreq(index) {
    var nyquist = context.sampleRate/2;
    return nyquist/this.getFFTBinCount() * index;
  }

  freqToIndex(frequency) {
    var nyquist = context.sampleRate/2;
    return Math.round(frequency/nyquist * this.getFFTBinCount());
  }

  getFFTBinCount() {
    return this.fftsize / 2;
  }

  onStream(stream) {
    console.log('dhkf');
    var input = context.createMediaStreamSource(stream);
    var analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0;
    analyser.fftSize = this.fftsize;

    // Connect graph.
    input.connect(analyser);

    this.analyser = analyser;
    // Setup a timer to visualize some stuff.
    this.render();
  }

  onStreamError(e) {
    console.error(e);
  }

  getGrayColor(value) {
    return 'rgb(V, V, V)'.replace(/V/g, 255 - value);
  }

  getFullColor(value) {
    var fromH = 280;
    var toH = 0;
    var percent = value / 255;
    var delta = percent * (toH - fromH);
    var hue = fromH + delta;
    return ('hsl(H, 120%, 50%)'.replace(/H/g, hue));
  }

  _logChanged() {
    console.log('loggggg');
    if (this.labels) {
      this.renderAxesLabels();
    }
  }

  _ticksChanged() {
    if (this.labels) {
      this.renderAxesLabels();
    }
  }

  _labelsChanged() {
    if (this.labels) {
      this.renderAxesLabels();
    } else {
      this.clearAxesLabels();
    }
  }
    
  _isAnimation(t_domain){
      return t_domain === 'animation';
  }
}
window.customElements.define(VSpectrogramCore.is, VSpectrogramCore);
