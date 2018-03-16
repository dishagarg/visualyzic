/* eslint-disable */
// Assumes context is an AudioContext defined outside of this class.

class VScene extends Polymer.Element {
  static get is() {return 'v-scene';}

  static get properties() {
    return {
      isBeat: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
          value: false,
      },
        volume: {
            type: Number,
            notify: true,
            reflectToAttribute: true,
            value: 0,
        },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer();
    // create mouse controls
    var controls = new (require('three-orbit-controls')(THREE))(camera);
    // initial camera position
    camera.position.z = 900;
    // set renderer fullscreen
    renderer.setSize(window.innerWidth, window.innerHeight);
    // add to dom
    document.getElementById('scene').appendChild(renderer.domElement);
    var pointLight = new THREE.PointLight(0xFFFFFF, 1, 0, 2);
    var ambientLight = new THREE.AmbientLight(0x404040);
    // set where you want the light to be directed at
    pointLight.position.set(10, 50, 130);
    var sphereColors = [{r:156,g:0,b:253},{r:0,g:255,b:249},{r:0,g:253,b:40},{r:245,g:253,b:0},{r:252,g:15,b:145}];
    var activeColor = 0;
    var sphereRadius = 150;
    var sphereSegments = 24;
    var sphereRings = 24;
    var sphereMaterial = new THREE.MeshLambertMaterial({
      color: 0xCC0000
    });
    var sphereGeometry = new THREE.SphereGeometry(sphereRadius, sphereSegments, sphereRings);
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // add all objects to scene
    scene.add(ambientLight);
    scene.add(pointLight);
    scene.add(sphere);
    this.getScene(this.isBeat, this.volume);
  }

  getScene(isBeat, volume) {
    // change sphere color every beat
    if (isBeat) {
      let color = sphereColors[activeColor];
      sphere.material.color = new THREE.Color(`rgb(${color.r},${color.g},${color.b})`);
      activeColor = activeColor < sphereColors.length - 1 ? activeColor + 1 : 0;
    }

    // change sphere size based on volume
    sphere.scale.x = .3 + (volume / 2);
    sphere.scale.y = .3 + (volume / 2);
    sphere.scale.z = .3 + (volume / 2);

    // rerender scene every update
    renderer.render(scene, camera);
  }


}
window.customElements.define(VScene.is, VScene);
