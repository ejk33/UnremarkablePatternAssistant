// @flow

import type { MapDifficulty, Note } from "./MapDifficulty";

import { HandsTracker } from "./HandsTracker";

export type NotePattern = {
    notes: Array<Note>
}

type NoteGroups = Array<NotePattern>;

function patternHasDots(pattern: NotePattern): boolean {
    for (let note of pattern.notes) {
        if (note.direction === 'DOT') {
            return true;
        }
    }
    return false;
}

export function analyzeMapPatterns(mapDifficulty: MapDifficulty): NoteGroups {
    const notes = mapDifficulty.notes;
    const groups: NoteGroups = [];
    let currentGroup: NotePattern = {
        notes: []
    };
    let lastTimestamp = 0;

    function breakGroup() {
        if (!patternHasDots(currentGroup)) {
            groups.push(currentGroup);
        }
        currentGroup = {
            notes: []
        }
    }

    const handTracker = new HandsTracker();

    for (let note of notes) {
        handTracker.applyNote(note);
        if (note.time - lastTimestamp > 1 && currentGroup.notes.length > 0) {
            // break due to long pause
            breakGroup();
        } else if (currentGroup.notes.length >= 15 && !handTracker.areHandsHorizontal() && !handTracker.areHandsTangled()) {
            // group size limit reached
            breakGroup();
        } else {
            currentGroup.notes.push(note);
        }

        lastTimestamp = note.time;
    }

    return groups;
}