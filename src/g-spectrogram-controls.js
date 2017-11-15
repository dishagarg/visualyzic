
class GSpectrogramControls extends Polymer.Element {
  static get is() { return 'g-spectrogram-controls'; }

  static get properties() {
    return {
        log: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
          value: false
      },
        labels: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
          value: false
      },
        ticks: {
          type: Number,
          notify: true,
          reflectToAttribute: true,
          value: 5
      },
      color: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
          value: false
      },
      speed: {
          type: Number,
          notify: true,
          reflectToAttribute: true,
          value: 2
      },
      t_domain: {
          type: String,
          notify: true,
          reflectToAttribute: true,
          value: "freq"
      },
    };
  }
 constructor() {
    super();
    console.log('Created spectrogram controls');
  }
}
window.customElements.define(GSpectrogramControls.is, GSpectrogramControls);
