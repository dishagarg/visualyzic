A live-input spectrogram written using [Polymer][polymer] using the [Web
Audio API][wapi].

https://jmperezperez.com/bpm-detection-javascript/

<!--more-->

# How to start?

1. Run `npm install`
2. `npm install -g gulp`
3. `gulp browser-sync`
This should fire up your default browser.
It reloads for a while and then asks for a mic permission.



# Configuration parameters

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


# Using the Polymer component

Simplest possible version:

    <g-spectrogram/>

Enable controls:

    <g-spectrogram controls>
    </g-spectrogram>

Pass parameters to the component:

    <g-spectrogram log labels ticks="10">
    </g-spectrogram>
