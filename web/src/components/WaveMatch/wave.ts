import { TWaveOptions } from "@typings/waveMatch";

const PI = Math.PI;
const TWO_PI = PI * 2;
const HALF_PI = PI / 2;

const SINE = Math.sin;

export class SineWaveGenerator {
    // Defaults stored in waveOptions
    private defaultWaveOptions: Required<TWaveOptions> = {
        speed: 10,
        amplitude: 50,
        wavelength: 50,
        segmentLength: 10,
        lineWidth: 2,
        strokeStyle: 'rgba(255, 0, 0, 1)', // Solid red for visibility
        timeModifier: 1,
    };

    private wave: Required<TWaveOptions> = { ...this.defaultWaveOptions };
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private devicePixelRatio: number;
    private waveLeft: number;
    private waveWidth: number;
    private time: number = 0;

    constructor(element: HTMLCanvasElement, waveOptions?: TWaveOptions) {
        this.ctx = element.getContext('2d')!;
        this.updateCanvasSize(element);
        this.updateWaveOptions(waveOptions);
    }

    private updateCanvasSize(element: HTMLCanvasElement): void {
        this.width = element.width;
        this.height = element.height;
        this.devicePixelRatio = window.devicePixelRatio || 1;
        element.width = this.width * this.devicePixelRatio;
        element.height = this.height * this.devicePixelRatio;
        this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    }

    public updateWaveOptions(waveOptions?: TWaveOptions): void {
        if (waveOptions) {
            this.wave = { ...this.defaultWaveOptions, ...waveOptions };
        } else {
            this.wave = { ...this.defaultWaveOptions };
        }
        this.waveLeft = this.width * 0.025;
        this.waveWidth = this.width * 0.95;
    }

    public clear(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    public update(time?: number): void {
        this.time -= 0.1; // Increased time change for more noticeable movement
        time = time === undefined ? this.time : time;
        const timeModifier = this.wave.timeModifier;
        this.drawSine(time * timeModifier, this.wave);
    }

    private ease(percent: number, amplitude: number): number {
        return amplitude * (SINE(percent * TWO_PI - HALF_PI) + 1) * 0.5;
    }

    private drawSine(time: number, options: Required<TWaveOptions>): void {
        const { amplitude, wavelength, lineWidth, strokeStyle } = options;
        let { segmentLength } = options;
        segmentLength = segmentLength || 0.1;
        let x = time;
        let y = 0;
        let amp = this.wave.amplitude;

        const yAxis = this.height / 2;

        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();

        this.ctx.moveTo(0, yAxis);
        this.ctx.lineTo(this.waveLeft, yAxis);

        for (let i = 0; i < this.waveWidth; i += segmentLength) {
            x = time * this.wave.speed + (-yAxis + i) / wavelength;
            y = SINE(x);

            amp = this.ease(i / this.waveWidth, (amplitude * 1.5));

            this.ctx.lineTo(i + this.waveLeft, amp * y + yAxis);
        }

        this.ctx.lineTo(this.width, yAxis);
        this.ctx.stroke();
    }

    public render(): void {
        this.clear();
        this.update();
    }

    public destroy(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.closePath();
        this.ctx.stroke();
    }
}
