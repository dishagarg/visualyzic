/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

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
      t_domain: {
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
  _getOption(t_domain){
    return (t_domain=='time') ? true : false;
  }
}
window.customElements.define(VSpectrogramControls.is, VSpectrogramControls);
