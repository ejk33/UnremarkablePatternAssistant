// @flow

import type { NotePattern } from "./Analyzer";
import type { Note, NoteColumn, NoteDirection, NoteRow } from "./MapDifficulty";

import { directionsMinimumAbsDifference } from "./MapDifficulty";

export type SingleHandState = {
    column: NoteColumn,
    row: NoteRow,
    direction: NoteDirection
}

export type HandState = {
    left: ?SingleHandState,
    right: ?SingleHandState
}


type DirectionChecker = (before: NoteDirection, after: NoteDirection) => boolean;

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

    clone(): HandsTracker {
        const newTracker = new HandsTracker();
        newTracker.state = JSON.parse(JSON.stringify(this.state));
        return newTracker;
    }


    canNoteFollowFluidly(hand: SingleHandState, note: Note): boolean {
        const before = hand.direction;
        const after = note.direction;
        const absDiff = directionsMinimumAbsDifference(before, after);
        return absDiff <= 1; // Max 45deg of change
    }

    canNoteBeApplied(note: Note): boolean {
        const tracker = this.clone();
        let hand = null;
        let otherHand = null;
        if (note.type === 'red') {
            hand = tracker.state.left;
            otherHand = tracker.state.right;
        }
        if (note.type === 'blue') {
            hand = tracker.state.right;
            otherHand = tracker.state.left;
        }

        // No hands initialized, note is always allowed
        if (hand == null && otherHand == null) {
            return true;
        }

        // The other hand is not initialized.
        // Do a simple check
        if (otherHand == null && hand != null) {
            return tracker.canNoteFollowFluidly(hand, note);
        }

        // The hand was not initialized yet. Require it not to tangle
        // With the other after applying this note
        if (hand == null) {
            tracker.applyNote(note);
            return !tracker.areHandsTangled() && !tracker.areHandsHorizontal();
        }

        // Both hands are initialized. The note must follow smoothly
        // and not cause a tangle
        const fluid = tracker.canNoteFollowFluidly(hand, note);
        if (!fluid) {
            return false;
        }
        // Apply and check tangle
        tracker.applyNote(note);
        return !tracker.areHandsHorizontal() && !tracker.areHandsTangled();
    }

    canPatternBeAppliedNext(pattern: NotePattern): boolean {
        // Clone the tracker
        // A full tracker is required because in a pattern, one hand's inputs
        // may occur much later than the other.
        // We need to have full hand tracking to know if there will be any clashes
        const tmpTracker = this.clone();

        let leftChained = false;
        let rightChained = false;

        // Once both have been chained, or the pattern has reached the end, we terminate the loop
        for (let note of pattern.notes) {
            if (leftChained && rightChained) {
                return true;
            }

            const canBeApplied = tmpTracker.canNoteBeApplied(note);
            if (!leftChained && note.type === 'red') {
                if (!canBeApplied) {
                    // Left chaining failed
                    return false;
                } else {
                    // Left chained!
                    leftChained = true;
                }
            }
            if (!rightChained && note.type === 'blue') {
                if (!canBeApplied) {
                    // Right chaining failed
                    return false;
                } else {
                    // Right chained!
                    rightChained = true;
                }
            }

            // Apply
            tmpTracker.applyNote(note);
        }

        return true;
    }
}