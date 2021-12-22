// @flow

import type { NotePattern } from "./Analyzer";

import type { Difficulty } from "./MapDifficulty";

import { HandsTracker } from "./HandsTracker";

export type PatternClassification = {
    hasHorizontals: boolean,
    hasStacksOrTowers: boolean,
    hasTangles: boolean,
    hasHighNotes: boolean,
    hasBombs: boolean,
    hasParityIssues: boolean
}

function hasBombs(pattern: NotePattern): boolean {
    for (let note of pattern.notes) {
        if (note.type === 'bomb') {
            return true;
        }
    }
    return false;
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

function hasParityIssues(pattern: NotePattern): boolean {
    const tracker = new HandsTracker();
    for (let note of pattern.notes) {
        tracker.applyNote(note);
    }
    return tracker.isParityViolated();
}

export function classifyPattern(pattern: NotePattern): void {
    pattern.classification = {
        hasHorizontals: hasHorizontals(pattern),
        hasHighNotes: hasHighNotes(pattern),
        hasStacksOrTowers: hasStacksOrTowers(pattern),
        hasTangles: hasTangles(pattern),
        hasBombs: hasBombs(pattern),
        hasParityIssues: hasParityIssues(pattern)
    }
}

export function isPatternSuitableForDifficulty(difficulty: Difficulty, pattern: NotePattern): boolean {
    const classification = pattern.classification;
    if (classification == null) {
        throw new Error('Classification was not run');
    }

    // Never suggest parity violating patterns for any difficulty
    if (classification.hasParityIssues) {
        return false;
    }

    if (difficulty <= 7 && classification.hasHorizontals) {
        return false;
    }

    if (difficulty <= 5 && classification.hasStacksOrTowers) {
        return false;
    }

    if (difficulty <= 3 && classification.hasTangles) {
        return false;
    }

    if (difficulty <= 1 && classification.hasHighNotes) {
        return false;
    }

    return true;
}