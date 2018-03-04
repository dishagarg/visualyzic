/* eslint-disable */
// Assumes context is an AudioContext defined outside of this class.

class VOscillator extends Polymer.Element {
    static get is() {return 'v-oscillator';}
    static get properties() {
        return {
            gainAmount: {
              type: Number,
              notify: true,
              reflectToAttribute: true,
              value: 0.2,
            },
            history: {
              type: Array,
              notify: true,
              reflectToAttribute: true,
              value: [],
            },
            log: {
              type: Boolean,
              notify: true,
              reflectToAttribute: true,
              value: false,
            },
            speed: {
              type: Number,
              notify: true,
              reflectToAttribute: true,
              value: 2,
            },

            fadeTime: {
              type: Number,
              notify: true,
              reflectToAttribute: true,
              value: 0.01,
            },
        };
    }
  connectedCallback() {
    super.connectedCallback();
    console.log('attachedCall');
    this.loop();
  }

  loop() {
    console.log('loopFunc');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.addHistory(this.lastY);
    var canvas = this.$.freq;
    var ctx = canvas.getContext('2d');
    canvas.width = this.width;
    canvas.height = this.height;

    var size = 6;
    // var nyquist = context.sampleRate/2;

    for (var i = 0; i < this.history.length; i++) {
      var y = this.history[i];
      if (y === null) {
        continue;
      }
      var x = this.width - (this.history.length - i - 1) * this.speed;
      // TODO: Eliminate fudge factor.
      ctx.fillStyle = 'red';
      ctx.fillRect(x - size/2, y - size/2, size, size);
    }

    if (this.osc_) {
      // Label the point.
      var label = this.formatFrequency_(this.lastFreq);
      ctx.font = '20px Inconsolata';
      ctx.fillText(label, this.lastX, this.lastY);
    }
    requestAnimationFrame(this.loop.bind(this));
  }

  formatFrequency_(freq) {
    return Math.round(freq) + ' Hz';
  }

  onMouseDown(event) {
    console.log('md');
    if (this.osc_) {
      // There can be only one oscillator.
      return;
    }
    this.updatePointer(event);
    // Create an oscillator.
    this.osc_ = this.createOscillator_();
    this.lastFreq = this.getLastFrequency();
    this.osc_.frequency.value = this.lastFreq;
  }

  onMouseUp() {
    console.log('mu');
    this.deleteOscillator_();
    this.updatePointer(null);
    this.lastFreq = null;
  }

  onMouseMove(event) {
    console.log('mm');
    if (this.osc_) {
      this.updatePointer(event);
      this.lastFreq = this.getLastFrequency();
      this.osc_.frequency.value = this.lastFreq;
    }
    // var canvas = this.$.freq;
    // var ctx = canvas.getContext('2d');
    /* var zoom = this.$.zoom;
    var zoomCtx = zoom.getContext('2d');
    zoomCtx.fillStyle = "white";
    zoomCtx.fillRect(0,0, zoom.width, zoom.height);
    zoomCtx.drawImage(canvas, event.x, event.y, 200, 100, 0,0, 200, 200);
    console.log(zoom.style);
    zoom.style.top = event.pageY + 10 + "px";
    zoom.style.left = event.pageX + 10 + "px";
    zoom.style.display = "block";*/
  }

  onMouseOut(event) {
    console.log('mo');
    this.deleteOscillator_();
    this.updatePointer(null);
    this.lastFreq = null;
  }

  onTouchStart(event) {
    event.preventDefault();
    console.log('ts');
    if (this.osc_) {
      return;
    }
    this.updatePointer(event);
    // Create an oscillator.
    this.osc_ = this.createOscillator_();
    this.lastFreq = this.getLastFrequency();
    this.osc_.frequency.value = this.lastFreq;
  }

  onTouchMove(event) {
    event.preventDefault();
    console.log('tm');
    if (this.osc_) {
      this.updatePointer(event);
      this.lastFreq = this.getLastFrequency();
      this.osc_.frequency.value = this.lastFreq;
    }
  }

  onTouchEnd(event) {
    event.preventDefault();
    console.log('te');
    this.updatePointer(null);
    this.deleteOscillator_();
    this.lastFreq = null;
  }

  updatePointer(event) {
    event = event || {};
    var type = event.type || '';
    if (type.indexOf('mouse') == 0) {
      this.lastX = event.pageX;
      this.lastY = event.pageY;
    } else if (type.indexOf('touch') == 0) {
      this.lastX = event.touches[0].pageX;
      this.lastY = event.touches[0].pageY;
    } else {
      this.lastX = null;
      this.lastY = null;
    }
  }

  addHistory(freq) {
    if (this.history.length > 100) {
      this.history.splice(0, 1);
    }
    this.history.push(freq);
  }

  getLastFrequency() {
    // var x = this.lastX;
    var y = this.lastY;

    // Linearly divide the Y axis and assign frequency.
    var percent = 1 - (y / this.height);
    var nyquist = context.sampleRate/2;
    if (this.log) {
      percent = this.logScale_(percent * 1000, 1000) / 1000;
    }
    return percent * nyquist;
  }

  createOscillator_() {
    // Create a gain node.
    var gain = context.createGain();
    gain.gain.value = 0;
    gain.connect(context.destination);
    // TODO: Clean this up!
    this.gain_ = gain;

    // Create an oscillator and connect it through the gain.
    var osc = context.createOscillator();
    osc.connect(gain);

    // Start it with a fade-in.
    gain.gain.linearRampToValueAtTime(this.gainAmount,
        context.currentTime + this.fadeTime);
    osc.start(0);
    return osc;
  }

  deleteOscillator_() {
    if (this.osc_) {
      var endTime = context.currentTime + this.fadeTime;
      this.gain_.gain.linearRampToValueAtTime(0, endTime);
      this.osc_.stop(endTime);
      this.osc_ = null;
    }
  }

  /**
   * Given an index and the total number of entries, return the
   * log-scaled value.
   */
  logScale_(index, total, optBase) {
    var base = optBase || 2;
    var logmax = this.logBase(total + 1, base);
    var exp = logmax * index / total;
    return Math.pow(base, exp) - 1;
  }

  logBase(val, base) {
    return Math.log(val) / Math.log(base);
  }
}
    window.customElements.define(VOscillator.is, VOscillator);
