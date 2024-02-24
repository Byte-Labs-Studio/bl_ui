


export async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function angle(cx: number, cy: number, ex: number, ey: number) {
    const dy = ey - cy;
    const dx = ex - cx;
    const rad = Math.atan2(dy, dx); // range (-PI, PI]
    const degrees = rad * 180 / Math.PI; // range (-180, 180]
    return degrees;
}

export function numberToAngle(angle: number) {
    if (angle > 180) {
        return angle - 360;
    }
    return angle;
}