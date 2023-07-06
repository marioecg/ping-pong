import * as THREE from 'three'

let width = 400
let height = 400

let renderer, camera
let renderPass, renderTargetA, renderTargetB
let scene, cube

let orthoCamera, postScene1, postMesh1, postScene2, postMesh2

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
    renderPass = new THREE.WebGLRenderTarget(width * devicePixelRatio, height * devicePixelRatio)
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
    let planeGeom = new THREE.PlaneGeometry(2, 2)

    // Quad 1
    postScene1 = new THREE.Scene()

    let postMat1 = new THREE.ShaderMaterial({
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
            uv.y += 0.05;

            vec4 inputColor = texture2D(tDiffuse, uv);
            
            gl_FragColor = inputColor;
            gl_FragColor.r += 0.01;
        }`,
        uniforms: {
            tDiffuse: { value: null },
        },
    })

    postMesh1 = new THREE.Mesh(planeGeom, postMat1)
    postScene1.add(postMesh1)

    // Quad 2
    postScene2 = new THREE.Scene()

    let postMat2 = new THREE.ShaderMaterial({
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

            vec4 inputColor = texture2D(tDiffuse, uv);
            
            gl_FragColor = inputColor;
        }`,
        uniforms: {
            tDiffuse: { value: null },
        },
    })

    postMesh2 = new THREE.Mesh(planeGeom, postMat2)
    postScene2.add(postMesh2)
}

function render() {
    cube.rotation.x += 0.005
    cube.rotation.y += 0.005
    cube.rotation.z += 0.005

    // "Render pass" contains the main scene, we want to render it to the renderPass
    renderer.setRenderTarget(renderPass)
    renderer.render(scene, camera)   

    postMesh1.material.uniforms.tDiffuse.value = renderPass.texture
    
    renderer.setRenderTarget(null)
    renderer.render(postScene1, orthoCamera)

    // renderer.autoClearColor = false    

    // Explicitly set renderTargetA as the framebuffer to render to
    renderer.setRenderTarget(renderTargetA)    

    // Render the postScene to renderTargetA,
    // this will contain the ping-pong accumulated texture
    renderer.render(postScene1, orthoCamera)    
    
    // Render the original scene containing 3D objects on top
    renderer.render(scene, camera)    

    // Set the device screen as the framebuffer to render to
    renderer.setRenderTarget(null)    

    // Pass the target texture to the postMesh2 quad 
    // that covers the device screen
    postMesh2.material.uniforms.tDiffuse.value = renderTargetA.texture   
    
    // Render postScene2 to the default framebuffer
    renderer.render(postScene2, orthoCamera) 
    
    // Swap the render targets
    let temp = renderTargetA
    renderTargetA = renderTargetB
    renderTargetB = temp
}