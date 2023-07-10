// Convenience function to render something to a write buffer of a double buffer and then swap it
function drawToBufferAndSwap(renderer, doubleBuffer, draw) {
    // Set the write buffer as the active render target
    renderer.setRenderTarget(doubleBuffer.getWriteBuffer())
    
    // Clear the write buffer
    renderer.clear()
    
    draw()

    // Reset the render target to the default buffer
    renderer.setRenderTarget(null)

    // Swap the buffers
    doubleBuffer.swap()

    // After this, what was written to the write buffer is in the read buffer and is ready for the next step
}

export { drawToBufferAndSwap }