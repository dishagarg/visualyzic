/* eslint-disable */

class VSpectrogramControls extends Polymer.Element {
  static get is() {return 'v-spectrogram-controls';}

  static get properties() {
    return {
        log: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
          value: false,
      },
        labels: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
          value: false,
      },
        ticks: {
          type: Number,
          notify: true,
          reflectToAttribute: true,
          value: 5,
      },
      color: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
          value: false,
      },
      visual: {
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
      tDomain: {
          type: String,
          notify: true,
          reflectToAttribute: true,
          value: 'freq',
      },
    };
  }
  constructor() {
    super();
    console.log('Created spectrogram controls');
  }
  _whichDomain(tDomain) {
    return (tDomain=='time') ? true : false;
  }
  _getClassAnimation(tDomain) {
      return tDomain === 'animation' ? 'animation' : '';
  }
}
window.customElements.define(VSpectrogramControls.is, VSpectrogramControls);
