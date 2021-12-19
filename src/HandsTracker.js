// @flow

import type { Note, NoteColumn, NoteDirection, NoteRow } from "./MapDifficulty";

export type SingleHandState = {
    column: NoteColumn,
    row: NoteRow,
    direction: NoteDirection
}

export type HandState = {
    left: ?SingleHandState,
    right: ?SingleHandState
}

export class HandsTracker {
    state: HandState;

    constructor() {
        this.state = {
            left: null,
            right: null
        }
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
            this.state.left = {
                column: note.column,
                row: note.row,
                direction: note.direction
            };
        }
        if (color === 'blue') {
            this.state.right = {
                column: note.column,
                row: note.row,
                direction: note.direction
            };
        }
    }
}