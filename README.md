A spectrogram written using [Polymer](https://www.polymer-project.org/2.0/start/) with the [Web
Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).
This spectrogram can process a live-input or detect and play any song using spotify API.
Give it a go!

https://visualyzic.firebaseapp.com/


# How to run locally?

1. Run `npm install -g bower polymer-cli`
2. `npm install`
3. `bower install`
4. `npm start`
This should fire up your default browser and ask for a mic permission.


# About configuration parameters

The following are HTML attributes of the `g-spectrogram` component. Many
of them are also configurable via the spectrogram controls component,
which shows up if the `controls` attribute is set to true.

- `controls` (boolean): shows a config UI component.
- `log` (boolean): enables y-log scale (linear by default).
- `speed` (number): how many pixels to move past for every frame.
- `labels` (boolean): enables y-axis labels.
- `ticks` (number): how many y labels to show.
- `color` (boolean): turns on color mode (grayscale by default).
- `oscillator` (boolean): enables an oscillator overlay component. When
  you click anywhere in the spectrogram, a sine wave plays corresponding
  to the frequency you click on.


# About using a Polymer component

Simplest possible version:

    <g-spectrogram/>

Enabling controls:

    <g-spectrogram controls>
    </g-spectrogram>

Passing parameters to a component:

    <g-spectrogram log labels ticks="10">
    </g-spectrogram>
