// @flow

import type { NotePattern } from "./Analyzer";

import { HandsTracker } from "./HandsTracker";

export type PatternClassification = {
    hasHorizontals: boolean,
    hasStacksOrTowers: boolean,
    hasTangles: boolean,
    hasHighNotes: boolean,
}

function hasHorizontals(pattern: NotePattern): boolean {
    for (let note of pattern.notes) {
        if (note.direction === 'E' || note.direction === 'W') {
            return true;
        }
    }
    return false;
}

function hasStacksOrTowers(pattern: NotePattern): boolean {
    let lastTime = -1;
    let lastHasRed = false;
    let lastHasBlue = false;
    for (let note of pattern.notes) {
        // Reset if time has advanced
        if ((note.time - lastTime) > (1/64)) {
            lastHasRed = false;
            lastHasBlue = false;
        }
        
        // Check if current note is part of stack
        if (note.type === 'red' && lastHasRed) {
            return true;
        }
        if (note.type === 'blue' && lastHasBlue) {
            return true;
        }

        // Update last values
        if (note.type === 'red') {
            lastHasRed = true;
        }
        if (note.type === 'blue') {
            lastHasBlue = true;
        }
        lastTime = note.time;
    }
    return false;
}

function hasTangles(pattern: NotePattern): boolean {
    const tracker = new HandsTracker();
    for (let note of pattern.notes) {
        tracker.applyNote(note);
        if (tracker.areHandsTangled()) {
            return true;
        }
    }
    return false;
}

function hasHighNotes(pattern: NotePattern): boolean {
    for (let note of pattern.notes) {
        if (note.row === 2) {
            return true;
        }
    }
    return false;
}

export function classifyPattern(pattern: NotePattern): PatternClassification {
    return {
        hasHorizontals: hasHorizontals(pattern),
        hasHighNotes: hasHighNotes(pattern),
        hasStacksOrTowers: hasStacksOrTowers(pattern),
        hasTangles: hasTangles(pattern)
    }
}