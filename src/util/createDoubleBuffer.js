import * as THREE from 'three'

function createDoubleBuffer(width, height) {
    let output = {
        // An integer index telling which one is the read buffer
        readBufferIndex: 0,
        
        // An array of render targets, containing only two render targets
        renderTargets: [],

        // Return the read buffer
        getReadBuffer: function () {
            return this.renderTargets[this.readBufferIndex]
        },
        
        // Return the write buffer
        getWriteBuffer: function () {
            return this.renderTargets[1 - this.readBufferIndex]
        },

        // Exchange the roles of the buffers
        swap: function () {
            this.readBufferIndex = 1 - this.readBufferIndex
        }
    }

    // Allocate the render targets
    output.renderTargets.push(new THREE.WebGLRenderTarget(width, height, {
        type: THREE.FloatType
    }))
    output.renderTargets.push(new THREE.WebGLRenderTarget(width, height, {
        type: THREE.FloatType
    }))

    return output
}

export { createDoubleBuffer }