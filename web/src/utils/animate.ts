export function createAnimation(callback) {
    const FPS = 60;
    const FRAME_DURATION = 1000 / FPS;

    let animationRunning = true;

    function animate() {
        const start = Date.now();
        let now = start;
        let then = start;
        let delta = 0;
        let frame = 0;

        function loop() {
            if (!animationRunning) return;

            requestAnimationFrame(loop);
            now = Date.now();
            delta = now - then;

            if (delta > FRAME_DURATION) {
                then = now - (delta % FRAME_DURATION);
                callback(frame);
                frame++;
            }
        }

        loop();
    }

    function start() {
        animationRunning = true;
        animate();
    }

    function stop() {
        animationRunning = false;
    }

    return {
        start,
        stop,
    };
}