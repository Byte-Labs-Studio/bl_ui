


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

export function randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function distanceBetween(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function viewUnitToPx(unit: 'width' | 'height', value: number) {
    if (unit === 'width') {
        return value *( window.innerWidth / 100);
    }
    return value * (window.innerHeight / 100);
}