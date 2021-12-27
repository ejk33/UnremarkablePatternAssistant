// @flow

export type AudioPositionState = {
    bpm: number;
    precision: number;
    length: number;
    preciseTimeSeconds: number;
}

export type AudioPositionPublicState = {
    ...AudioPositionState,
    beat: number,
    subBeat: number
}

export class AudioPosition {

    state: AudioPositionState;

    constructor(bpm: number, songLengthSeconds: number) {
        this.state = {
            bpm: bpm,
            precision: 4,
            length: songLengthSeconds,
            preciseTimeSeconds: 0
        };
    }

    setLength(length: number): void {
        this.state.length = length;
        this.snap();
    }

    _getSecondsPerBeat(): number {
        const beatsPerSecond = this.state.bpm / 60;
        const secondsPerBeat = 1 / beatsPerSecond;
        return secondsPerBeat;
    }

    _getSecondsPerSubBeat(): number {
        const secondsPerBeat = this._getSecondsPerBeat();
        const secondsPerSubBeat = secondsPerBeat / this.state.precision;
        return secondsPerSubBeat;
    }

    setAudioRawPositionSeconds(position: number): void {
        this.state.preciseTimeSeconds = position;
    }

    // Used before doing forward, backward, and stop play
    snap(): void {
        const secondsPerSubBeat = this._getSecondsPerSubBeat();
        const subBeatIndex = Math.round(this.state.preciseTimeSeconds / secondsPerSubBeat);
        let preciseTime = subBeatIndex * secondsPerSubBeat;
        if (preciseTime < 0) {
            preciseTime = 0;
        }
        if (preciseTime > this.state.length) {
            this.state.preciseTimeSeconds -= this._getSecondsPerSubBeat();
            this.snap();
            return;
        }
        this.state = {
            bpm: this.state.bpm,
            precision: this.state.precision,
            length: this.state.length,
            preciseTimeSeconds: preciseTime,
        }
    }

    getStateCopy(): AudioPositionPublicState {
        const beat = Math.floor((1/128) + (this.state.preciseTimeSeconds / this._getSecondsPerBeat()));
        const subBeats = Math.round(this.state.preciseTimeSeconds / this._getSecondsPerSubBeat());
        const subBeat = subBeats % this.state.precision;
        return {
            ...this.state,
            beat,
            subBeat
        };
    }

    forward(): void {
        this.state.preciseTimeSeconds += this._getSecondsPerSubBeat();
        this.snap();
    }

    backward(): void {
        this.state.preciseTimeSeconds -= this._getSecondsPerSubBeat();
        this.snap();
    }

}