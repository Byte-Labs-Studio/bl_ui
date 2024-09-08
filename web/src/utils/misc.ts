import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import words from "./data/words";


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


export function degToRad(deg: number) {
    return deg * (Math.PI / 180)
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

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getRandomIntFromIntOrArray(num: number | [number, number]): number {
    let [MIN, MAX] = [null, null];

    if (Array.isArray(num)) {
        MIN = num[0];
        MAX = num[1];
    } else {
        MIN = num
        MAX = num;
    }

    return Math.floor(MIN + Math.random() * (MAX - MIN));
}

export function generateNumbers(length: number) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10));
}

export function getWordWithLength(length: number): string {
    const wordsWithLength = words[length];
    const randomIndex = Math.floor(Math.random() * wordsWithLength.length);
    return wordsWithLength[randomIndex];
}

export function deepClone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}