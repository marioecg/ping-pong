import * as THREE from 'three'

let width = 400
let height = 400

let renderer
let renderPassTarget, renderTargetA, renderTargetB
let camera, orthographic
let mainScene
let cube, quad, postQuad

init()
renderer.setAnimationLoop(render)

function init() {
    // renderer
    renderer = new THREE.WebGLRenderer({
        antialias: false,
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 1)

    let container = document.querySelector('#app')
    container.appendChild(renderer.domElement)

    // render targets
    renderPassTarget = new THREE.WebGLRenderTarget(width * devicePixelRatio, height * devicePixelRatio)
    renderTargetA = new THREE.WebGLRenderTarget(width * devicePixelRatio, height * devicePixelRatio)
    renderTargetB = new THREE.WebGLRenderTarget(width * devicePixelRatio, height * devicePixelRatio)

    // cameras
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000)
    camera.position.z = 5
    orthographic = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // scene
    mainScene = new THREE.Scene()

    // mesh
    cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial())
    mainScene.add(cube)

    // quads 
    let planeGeometry = new THREE.PlaneGeometry(2, 2)

    quad = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({ map: null }))
    quad.material.toneMapped = false

    // Post 
    postQuad = new THREE.Mesh(planeGeometry, new THREE.ShaderMaterial({
        vertexShader: /* glsl */`
        varying vec2 vUv;

        void main() {
            vUv = uv;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,

        fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        
        varying vec2 vUv;

        void main() {
            vec2 uv = vUv;

            uv.y += 0.01;

            vec4 color = texture2D(tDiffuse, vUv);

            gl_FragColor = color;

            gl_FragColor.a += 0.01;
        }`,

        uniforms: {
            tDiffuse: { value: null },
        }
    }))
}

function render() {
    cube.rotation.x += 0.005
    cube.rotation.y += 0.005
    cube.rotation.z += 0.005

    // --------------------
    // don't clear the contents of the canvas on each render
    // in order to achieve the effect, draw the new frame
    // on top of the previous one
    renderer.autoClearColor = false

    renderer.setRenderTarget(renderPassTarget)
    renderer.render(mainScene, camera)

    quad.material.map = renderPassTarget.texture

    // set renderTargetA as the framebuffer to render to
    renderer.setRenderTarget(renderTargetA)

    // render postQuad to renderTargetA,
    // this will contain the ping-pong accumulated texture
    renderer.render(postQuad, orthographic)

    // render on top the original scene (texture) containing the objects
    renderer.render(quad, orthographic)

    // set the device screen as the framebuffer to render to
    renderer.setRenderTarget(null)

    // pass the target texture to the quad that covers the device screen
    postQuad.material.uniforms.tDiffuse.value = renderTargetA.texture

    // render the post quad to the screen
    renderer.render(postQuad, orthographic)

    // swap the render targets
    let temp = renderTargetA
    renderTargetA = renderTargetB
    renderTargetB = temp
}