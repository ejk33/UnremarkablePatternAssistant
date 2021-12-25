// @flow

export type AudioPositionState = {
    bpm: number;
    precision: number;
    preciseTimeSeconds: number;
}

export type AudioPositionPublicState = {
    ...AudioPositionState,
    beat: number,
    subBeat: number
}

export class AudioPosition {

    state: AudioPositionState;

    constructor(bpm: number) {
        this.state = {
            bpm: bpm,
            precision: 4,
            preciseTimeSeconds: 0
        };
    }

    _getSecondsPerBeat(): number {
        const secondsPerBeat = 60 * this.state.bpm;
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
        this.state = {
            bpm: this.state.bpm,
            precision: this.state.precision,
            preciseTimeSeconds: subBeatIndex * secondsPerSubBeat
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
        this.snap();
        this.state.preciseTimeSeconds += this._getSecondsPerSubBeat();
    }

    backward(): void {
        this.snap();
        this.state.preciseTimeSeconds -= this._getSecondsPerSubBeat();
    }

}