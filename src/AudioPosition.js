// @flow

export type AudioPositionState = {
    bpm: number;
    precision: number;
    preciseTimeSeconds: number;
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

}