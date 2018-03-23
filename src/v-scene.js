/* eslint-disable */
// Assumes context is an AudioContext defined outside of this class.
class VScene extends Polymer.Element {
  static get is() {return 'v-scene';}

  static get properties() {
    return {
      isBeat: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true
      },
      volume: {
          type: Number,
          notify: true,
          reflectToAttribute: true
      },
      waveform: {
          type: Number,
          notify: true,
          reflectToAttribute: true
      },
      levels: {
          type: Number,
          notify: true,
          reflectToAttribute: true
      },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x204040 );
    this.renderer = new THREE.WebGLRenderer();
    
    // initial camera position
    this.camera.position.z = 900;
    // set renderer fullscreen
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // add to dom
    this.$.scene.appendChild(this.renderer.domElement);
    var pointLight = new THREE.PointLight(0xFFFFFF, 1, 0, 2);
    var ambientLight = new THREE.AmbientLight(0x204040);
    // set where you want the light to be directed at
    pointLight.position.set(10, 50, 130);
    
    /*Sphere*/
    this.sphereColors = [{r:156,g:0,b:253},{r:0,g:255,b:249},{r:0,g:253,b:40},{r:245,g:253,b:0},{r:252,g:15,b:145}];
    this.activeColor = 0;
    var sphereRadius = 150;
    var sphereSegments = 24;
    var sphereRings = 24;
    var sphereMaterial = new THREE.MeshLambertMaterial({
      color: 0xCC0000
    });
    var sphereGeometry = new THREE.SphereGeometry(sphereRadius, sphereSegments, sphereRings);
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    
    /*Plane*/
    var planePoints = 15;
    var planeMaterial = new THREE.MeshLambertMaterial({
      color: 0x8a8a8a,
      side: THREE.DoubleSide,
      wireframe: true,
      wireframeLinewidth: 1
    });
    var planeGeometry = new THREE.PlaneGeometry(400, 400, planePoints, planePoints);
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // var the renderer know we plan to update the vertices
    this.plane.geometry.verticesNeedUpdate = true;
    this.plane.geometry.dynamic = true;
    // rotate and position plane on ground
    this.plane.position.y = -200;
    this.plane.rotation.x = -Math.PI/2;

    
    this.plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
    // var the renderer know we plan to update the vertices
    this.plane2.geometry.verticesNeedUpdate = true;
    this.plane2.geometry.dynamic = true;
    // rotate and position plane on ground
    this.plane2.position.y = 200;
    this.plane2.rotation.x = Math.PI/2;
    
    
    
    this.plane3 = new THREE.Mesh(planeGeometry, planeMaterial);
    // var the renderer know we plan to update the vertices
    this.plane3.geometry.verticesNeedUpdate = true;
    this.plane3.geometry.dynamic = true;
    // rotate and position plane on ground
    this.plane3.position.x = -200;
    this.plane3.rotation.y = -Math.PI/2;
    
    
    this.plane4 = new THREE.Mesh(planeGeometry, planeMaterial);
    // var the renderer know we plan to update the vertices
    this.plane4.geometry.verticesNeedUpdate = true;
    this.plane4.geometry.dynamic = true;
    // rotate and position plane on ground
    this.plane4.position.x = 200;
    this.plane4.rotation.y = Math.PI/2;
    
    // add all objects to scene
    this.scene.add(ambientLight);
    this.scene.add(pointLight);
    this.scene.add(this.sphere);
    this.scene.add(this.plane);
    this.scene.add(this.plane2);
    this.scene.add(this.plane3);
    this.scene.add(this.plane4);
    
  }

  attributeChangedCallback() {
    super.attributeChangedCallback();
    // change sphere color every beat
    if (this.isBeat) {
      var color = this.sphereColors[this.activeColor];
      this.sphere.material.color = new THREE.Color(`rgb(${color.r},${color.g},${color.b})`);
      this.activeColor = this.activeColor < this.sphereColors.length - 1 ? this.activeColor + 1 : 0;
    }

    // change sphere size based on volume
    this.sphere.scale.x = .3 + (this.volume / 2);
    this.sphere.scale.y = .3 + (this.volume / 2);
    this.sphere.scale.z = .3 + (this.volume / 2);


    this.waveform.forEach(function(value, i){
      if (i%2 === 0 && this.plane.geometry.vertices[i/2]) {
        this.plane.geometry.vertices[i/2].z = value * 80;
        this.plane2.geometry.vertices[i/2].z = value * 80;
        this.plane3.geometry.vertices[i/2].z = value * 80;
        this.plane4.geometry.vertices[i/2].z = value * 80;
      }
    }.bind(this));
    this.plane.geometry.verticesNeedUpdate = true;
    this.plane2.geometry.verticesNeedUpdate = true;
    this.plane3.geometry.verticesNeedUpdate = true;
    this.plane4.geometry.verticesNeedUpdate = true;


    // rerender scene every update
    this.renderer.render(this.scene, this.camera);
    
  }
}
window.customElements.define(VScene.is, VScene);
