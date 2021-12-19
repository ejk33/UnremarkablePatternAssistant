// @flow

import type { NotePattern } from "./Analyzer";
import type { MapDifficulty, Note } from "./MapDifficulty";
import type { PatternDatabase } from "./PatternDatabase";

import { HandsTracker } from "./HandsTracker";
import Chance from 'chance';

function extractMappingTimes(mapDifficulty: MapDifficulty): Array<number> {
    const times: Array<number> = [];
    let lastTime = -1;

    for (let note of mapDifficulty.notes) {
        if (note.time !== lastTime) {
            times.push(note.time);
            lastTime = note.time;
        }
    }

    return times;
}

function pickEligiblePattern(handsTracker: HandsTracker, patternsDb: PatternDatabase): NotePattern {
    const eligiblePatterns: Array<NotePattern> = [];

    patternsDb.patterns.forEach((pattern, hash) => {
        if (handsTracker.canPatternBeAppliedNext(pattern)) {
            eligiblePatterns.push(pattern);
        }
    });

    if (eligiblePatterns.length === 0) {
        throw new Error('No patterns can be applied');
    }

    const chance = new Chance();

    const randIndex = chance.integer({
        min: 0,
        max: eligiblePatterns.length - 1
    });

    return eligiblePatterns[randIndex];
}

export function ReMap(mapDifficulty: MapDifficulty, patternsDb: PatternDatabase): void {
    const handsTracker = new HandsTracker();

    const newNotes: Array<Note> = [];
    const mappingTimes = extractMappingTimes(mapDifficulty);
    console.info('Remap locations:', mappingTimes);

    let mappingTimesIndex = -1;
    let lastSourceTime = -1;
    let currentPattern: ?NotePattern = null;

    while (true) {
        currentPattern = pickEligiblePattern(handsTracker, patternsDb);
        lastSourceTime = -1;
        console.info(`Remapping... At time index ${mappingTimesIndex}, Picked pattern `, currentPattern);

        for (let note of currentPattern.notes) {
            // Check termination
            if (mappingTimesIndex >= mappingTimes.length) {
                // Done
                mapDifficulty.notes = newNotes;
                return;
            }

            const isNoteOnSameTickAsPrevious = lastSourceTime === note.time;
            // Index is on previous note. Advance to current position
            // if new source note is not on the same tick
            if (!isNoteOnSameTickAsPrevious) {
                mappingTimesIndex += 1;
            }

            // Check termination
            if (mappingTimesIndex >= mappingTimes.length) {
                // Done
                mapDifficulty.notes = newNotes;
                return;
            }

            // Try to apply the note
            const newNote: Note = {
                column: note.column,
                row: note.row,
                direction: note.direction,
                type: note.type,
                time: mappingTimes[mappingTimesIndex]
            }
            handsTracker.applyNote(newNote);
            newNotes.push(newNote);
        }
    }
}