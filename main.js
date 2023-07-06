import * as THREE from 'three'

let width = 400
let height = 400

let renderer, camera
let renderTargetA, renderTargetB
let scene, cube

let orthoCamera, postScene, postMesh

init()
renderer.setAnimationLoop(render)

function init() {
    // renderer
    renderer = new THREE.WebGLRenderer({
        antialias: false,
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 1.0)

    let container = document.querySelector('#app')
    container.appendChild(renderer.domElement)

    // render targets
    renderTargetA = new THREE.WebGLRenderTarget(width * devicePixelRatio, height * devicePixelRatio)
    renderTargetB = new THREE.WebGLRenderTarget(width * devicePixelRatio, height * devicePixelRatio)

    // camera
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000)
    camera.position.z = 5

    // scene
    scene = new THREE.Scene()
    cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial())

    scene.add(cube)

    // ------------------------------
    // post processing
    // ------------------------------
    orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    postScene = new THREE.Scene()

    let planeGeom = new THREE.PlaneGeometry(2, 2)
    let postMat = new THREE.ShaderMaterial({
        vertexShader: /* glsl */`
        varying vec2 vUv;
        
        void main () {
            vUv = uv;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
        fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;

        varying vec2 vUv;
  
        void main () {
            vec2 uv = vUv;
            uv.y += 0.01;

            vec4 inputColor = texture2D(tDiffuse, uv);
            
            gl_FragColor = inputColor;
        }`,
        uniforms: {
            tDiffuse: { value: null },
        },
    })

    postMesh = new THREE.Mesh(planeGeom, postMat)
    postScene.add(postMesh)
}

function render() {
    cube.rotation.x += 0.005
    cube.rotation.y += 0.005
    cube.rotation.z += 0.005

    // Don't clear the contents of the canvas on each render
    // in order to achieve the effect, draw the new frame
    // on top of the previous one
    renderer.autoClearColor = false

    // Explicitly set renderTargetA as the framebuffer to render to
    renderer.setRenderTarget(renderTargetA)

    // Render the postScene to renderTargetA,
    // this will contain the ping-pong accumulated texture
    renderer.render(postScene, orthoCamera)    
    
    // Render the original scene containing 3D objects on top
    renderer.render(scene, camera)

    // Set the device screen as the framebuffer to render to
    renderer.setRenderTarget(null)

    // Pass the target texture to the postMesh quad 
    // that covers the device screen
    postMesh.material.uniforms.tDiffuse.value = renderTargetA.texture

    // Render the post mesh to the default framebuffer
    renderer.render(postScene, orthoCamera)

    // Swap the render targets
    let temp = renderTargetA
    renderTargetA = renderTargetB
    renderTargetB = temp
}