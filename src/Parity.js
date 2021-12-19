// @flow

import type { HandState, SingleHandState } from "./HandsTracker";
import type { Note, NoteDirection } from "./MapDifficulty";

function isLeftHandParityRespected(hand: SingleHandState, note: Note): boolean {
    if (hand.direction === 'DOT' || note.direction === 'DOT') {
        return true;
    }

    const isDown = (direction: NoteDirection) => {
        return ['E', 'SE', 'S', 'SW'].includes(direction);
    }

    return isDown(hand.direction) !== isDown(note.direction);
}

function isRightHandParityRespected(hand: SingleHandState, note: Note): boolean {
    if (hand.direction === 'DOT' || note.direction === 'DOT') {
        return true;
    }

    const isDown = (direction: NoteDirection) => {
        return ['SE', 'S', 'SW', 'W'].includes(direction);
    }

    return isDown(hand.direction) !== isDown(note.direction);
}

export function isParityRespected(hands: HandState, note: Note): boolean {
    const {left, right} = hands;

    if (note.type === 'red') {
        if (left == null) {
            // Nothing to check for left
            return true;
        } else {
            return isLeftHandParityRespected(left, note);
        }
    }

    if (note.type === 'blue') {
        if (right == null) {
            // Nothing to check for right
            return true;
        } else {
            return isRightHandParityRespected(right, note);
        }
    }

    // Bomb type, no checks
    return true;
}