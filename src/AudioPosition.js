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
        console.info('Length is being set to', length);
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
        console.info('<><><> seconds per beat ', secondsPerBeat, 'bpm is', this.state.bpm);
        const secondsPerSubBeat = secondsPerBeat / this.state.precision;
        console.info('<><><> seconds per subbeat is', secondsPerSubBeat);
        return secondsPerSubBeat;
    }

    setAudioRawPositionSeconds(position: number): void {
        this.state.preciseTimeSeconds = position;
    }

    // Used before doing forward, backward, and stop play
    snap(): void {
        const secondsPerSubBeat = this._getSecondsPerSubBeat();
        const remainder = this.state.preciseTimeSeconds % secondsPerSubBeat;

        const candidate1 = this.state.preciseTimeSeconds - remainder;
        const candidate2 = candidate1 + secondsPerSubBeat;
        console.info('<><><> candidates', {
            candidate1, candidate2
        })

        let candidate = 0
        if ((this.state.preciseTimeSeconds - candidate1) < (candidate2 - this.state.preciseTimeSeconds)) {
            console.info('chose candidate 1');
            candidate = candidate1;
        } else {
            console.info('chose candidate 1');
            candidate = candidate2;
        }

        if (candidate < 0) {
            console.info('left limit');
            this.state.preciseTimeSeconds = 0;
            return;
        }
        if (candidate > this.state.length) {
            console.info('right limit', this.state.length);
            this.state.preciseTimeSeconds = this.state.length;
            return;
        }

        console.info('regular');
        this.state.preciseTimeSeconds = candidate;
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
        console.info('forward. Before', this.state.preciseTimeSeconds);
        this.state.preciseTimeSeconds += this._getSecondsPerSubBeat();
        console.info('after', this.state.preciseTimeSeconds);
        this.snap();
        console.info('after snal', this.state.preciseTimeSeconds);
    }

    backward(): void {
        this.state.preciseTimeSeconds -= this._getSecondsPerSubBeat();
        this.snap();
    }

}