import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import baseVert from './shaders/base.vert'
import baseFrag from './shaders/base.frag'
import blurXShader from './shaders/blurX.frag'
import blurYShader from './shaders/blurY.frag'
import sRGBShader from './shaders/sRGB.frag'
import copyShader from './shaders/copy.frag'

import { createDoubleBuffer, drawToBufferAndSwap } from './util'

let width = 400
let height = 400

let renderer, camera, scene, cube, controls
let renderTarget
let blurXProgram, blurYProgram, srgbProgram, copyProgram
let buffer
let quad

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
    renderTarget = new THREE.WebGLRenderTarget(width, height, {
        type: THREE.FloatType,
    })
    buffer = createDoubleBuffer(width, height)

    // camera
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000)
    camera.position.z = 5
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    // scene
    scene = new THREE.Scene()
    cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial())

    scene.add(cube)

    // Programs (or materials)

    // Horizontal blur
    blurXProgram = new THREE.ShaderMaterial({
        vertexShader: baseVert,
        fragmentShader: blurXShader,
        uniforms: {
            tDiffuse: { value: null },
            uResolution: { value: new THREE.Vector2(width, height) },
        },
    })

    // Vertical blur
    blurYProgram = new THREE.ShaderMaterial({
        vertexShader: baseVert,
        fragmentShader: blurYShader,
        uniforms: {
            tDiffuse: { value: null },
            uResolution: { value: new THREE.Vector2(width, height) },
        },
    })
    
    // sRGB
    srgbProgram = new THREE.ShaderMaterial({
        vertexShader: baseVert,
        fragmentShader: sRGBShader,
        uniforms: {
            tDiffuse: { value: null },
        },
    })

    // Copy
    copyProgram = new THREE.ShaderMaterial({
        vertexShader: baseVert,
        fragmentShader: copyShader,
        uniforms: {
            tDiffuse: { value: null },
        },
    })

    // Fullscreen mesh
    quad = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({
            vertexShader: baseVert,
            fragmentShader: baseFrag,
        })
    )
}

function render() {
    controls.update()

    // Render scene to FBO
    renderer.setRenderTarget(renderTarget)

    // Blur X
    drawToBufferAndSwap(renderer, buffer, () => {
        blurXProgram.uniforms.tDiffuse.value = buffer.getReadBuffer().texture
        quad.material = blurXProgram
        renderer.render(quad, camera)
    })

    // Copy pixels to screen
    copyProgram.uniforms.tDiffuse.value = buffer.getReadBuffer().texture
    quad.material = copyProgram
    renderer.render(quad, camera)
}