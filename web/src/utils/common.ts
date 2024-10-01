import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import words from "@assets/words.json" 

// Localize constant-heavy functions
const PI = Math.PI;
const COS = Math.cos;
const SIN = Math.sin;
const SQRT = Math.sqrt;
const POW = Math.pow;
const ATAN2 = Math.atan2;
const FLOOR = Math.floor;
const RANDOM = Math.random;
const PARSE_JSON = JSON.parse;
const STRINGIFY_JSON = JSON.stringify;

export async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function angle(cx: number, cy: number, ex: number, ey: number) {
    const dy = ey - cy;
    const dx = ex - cx;
    const rad = ATAN2(dy, dx); // range (-PI, PI]
    const degrees = rad * 180 / PI; // range (-180, 180]
    return degrees;
}

export function numberToAngle(angle: number) {
    if (angle > 180) {
        return angle - 360;
    }
    return angle;
}

export function degToRad(deg: number) {
    return deg * (PI / 180);
}

export function randomBetween(min: number, max: number) {
    return RANDOM() * (max - min) + min;
}

export function distanceBetween(x1: number, y1: number, x2: number, y2: number) {
    return SQRT(POW(x2 - x1, 2) + POW(y2 - y1, 2));
}

export function viewUnitToPx(unit: 'width' | 'height', value: number) {
    if (unit === 'width') {
        return value * (window.innerWidth / 100);
    }
    return value * (window.innerHeight / 100);
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getRandomIntFromIntOrArray(num: number | [number, number]): number {
    let [MIN, MAX]: (number | null)[] = [null, null];

    if (!Array.isArray(num)) {
        return num;
    }

    MIN = num[0];
    MAX = num[1];

    return FLOOR(MIN + RANDOM() * (MAX - MIN));
}

export function generateNumbers(length: number) {
    return Array.from({ length }, () => FLOOR(RANDOM() * 10));
}

export function getWordWithLength(length: number | string | keyof typeof words): string {
    length = length.toString();
    const wordsWithLength = (words as any)[length];
    const randomIndex = FLOOR(RANDOM() * wordsWithLength.length);
    return wordsWithLength[randomIndex];
}

export function deepClone(obj: any) {
    return PARSE_JSON(STRINGIFY_JSON(obj));
}

export function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
): { x: number; y: number } {
    let angleInRadians = (angleInDegrees - 90) * PI / 180.0;
    return {
        x: centerX + (radius * COS(angleInRadians)),
        y: centerY + (radius * SIN(angleInRadians))
    };
}
