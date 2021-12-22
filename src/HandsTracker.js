// @flow

import type { Note, NoteColumn, NoteDirection, NoteRow } from "./MapDifficulty";

import { directionsMinimumAbsDifference } from "./MapDifficulty";
import { isParityRespected } from "./Parity";

export type SingleHandState = {
    column: NoteColumn,
    row: NoteRow,
    direction: NoteDirection,
}

export type HandState = {
    left: ?SingleHandState,
    right: ?SingleHandState,
    leftLastTime: number,
    rightLastTime: number,
    leftParityViolated: boolean,
    rightParityViolated: boolean
}

export class HandsTracker {
    state: HandState;

    constructor() {
        this.state = {
            left: null,
            right: null,
            leftLastTime: -1,
            rightLastTime: -1,
            leftParityViolated: false,
            rightParityViolated: false
        }
    }

    isParityViolated(): boolean {
        return this.state.leftParityViolated || this.state.rightParityViolated;
    }

    areHandsTangled(): boolean {
        const {left, right} = this.state;
        if (left == null || right == null) {
            return false;
        }

        // Definitely not tangled
        if (right.column > left.column) {
            return false;
        }

        // Definitely tangled
        if (right.column < left.column) {
            return true;
        }

        const leftHorizontalDirection = this.getHandHorizontalDirection(left);
        const rightHorizontalDirection = this.getHandHorizontalDirection(right);

        // Hands are in the same column, and they are both pointing vertically.
        // This is either an impossible or really bad pattern, so considering this
        // as tangled as well
        if (leftHorizontalDirection === rightHorizontalDirection) {
            return true;
        }

        // Tangled if hands are on same column but they are from different directions
        return leftHorizontalDirection !== rightHorizontalDirection;
    }

    getHandHorizontalDirection(hand: SingleHandState): 'left' | 'right' | 'none' {
        switch (hand.direction) {
            case 'W':
            case 'NW':
            case 'SW':
                return 'left';
            case 'E':
            case 'NE':
            case 'SE':
                return 'right';
            default:
                return 'none';
        }
    }

    getHandVerticalDirection(hand: SingleHandState): 'up' | 'down' | 'none' {
        switch (hand.direction) {
            case 'N':
            case 'NW':
            case 'NE':
                return 'up';
            case 'S':
            case 'SW':
            case 'SE':
                return 'down';
            default:
                return 'none';
        }
    }

    // Hands are in a horizontal position, swinging the same direction
    areHandsHorizontal(): boolean {
        const {left, right} = this.state;
        if (left == null || right == null) {
            return false;
        }

        const leftHorizontalDirection = this.getHandHorizontalDirection(left);
        const rightHorizontalDirection = this.getHandHorizontalDirection(right);
        if (leftHorizontalDirection === 'none' || rightHorizontalDirection === 'none') {
            return false;
        }

        return leftHorizontalDirection === rightHorizontalDirection;
    }

    applyNote(note: Note): void {
        const color = note.type;
        if (color === 'red') {
            if ((note.time - this.state.leftLastTime) > (1/64)) {
                const parityGood = isParityRespected(this.state, note);
                if (!parityGood) {
                    this.state.leftParityViolated = true;
                }
            }

            this.state.left = {
                column: note.column,
                row: note.row,
                direction: note.direction
            };

            this.state.leftLastTime = note.time;
        }
        if (color === 'blue') {
            if ((note.time - this.state.rightLastTime) > (1/64)) {
                const parityGood = isParityRespected(this.state, note);
                if (!parityGood) {
                    this.state.rightParityViolated = true;
                }
            }

            this.state.right = {
                column: note.column,
                row: note.row,
                direction: note.direction
            };

            this.state.rightLastTime = note.time;
        }
    }

    canNoteFollowFluidly(hand: SingleHandState, note: Note): boolean {
        const before = hand.direction;
        const after = note.direction;
        const absDiff = directionsMinimumAbsDifference(before, after);
        return absDiff <= 1; // Max 45deg of change
    }
}

export function cloneHandsTracker(tracker: HandsTracker): HandsTracker {
    const newTracker = new HandsTracker();
    newTracker.state = JSON.parse(JSON.stringify(tracker.state));
    return newTracker;
}