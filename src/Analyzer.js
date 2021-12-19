// @flow

import type { MapDifficulty, Note } from "./MapDifficulty";

import { HandsTracker } from "./HandsTracker";

type NoteGroup = {
    notes: Array<Note>
}

type NoteGroups = Array<NoteGroup>;

export function analyzeMapPatterns(mapDifficulty: MapDifficulty): NoteGroups {
    const notes = mapDifficulty.notes;
    const groups: NoteGroups = [];
    let currentGroup: NoteGroup = {
        notes: []
    };
    let lastTimestamp = 0;

    function breakGroup() {
        groups.push(currentGroup);
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
        } else if (currentGroup.notes.length >= 16 && !handTracker.areHandsHorizontal() && !handTracker.areHandsTangled()) {
            // group size limit reached
            breakGroup();
        } else {
            currentGroup.notes.push(note);
        }

        lastTimestamp = note.time;
    }

    return groups;
}