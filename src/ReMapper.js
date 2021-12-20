// @flow

import type { NotePattern } from "./Analyzer";
import type {
  Difficulty,
  MapDifficulty,
  Note,
  NoteDirection,
} from "./MapDifficulty";
import type { PatternDatabase } from "./PatternDatabase";

import { HandsTracker } from "./HandsTracker";
import { reverseDirection } from "./MapDifficulty";

import { isPatternSuitableForDifficulty } from "./PatternClassifier";

import Chance from 'chance';

const chance = new Chance();

function extractMappingTimes(mapDifficulty: MapDifficulty): Array<number> {
    const times: Array<number> = [];
    let lastTime = -1;

    for (let note of mapDifficulty.notes) {
        if (note.time - lastTime > (1 / 64)) {
            times.push(note.time);
            lastTime = note.time;
        }
    }

    return times;
}

function pickEligiblePattern(handsTracker: HandsTracker, patternsDb: PatternDatabase, difficulty: Difficulty): NotePattern {
    // Hands default state is Up, Up, so that the first notes to be initialized will be Down, Down
    let currentLeft: NoteDirection = handsTracker.state.left?.direction ?? 'N';
    let currentRight: NoteDirection = handsTracker.state.right?.direction ?? 'N';
    let reverseLeft = reverseDirection(currentLeft);
    let reverseRight = reverseDirection(currentRight);
    const newStartKey = `${reverseLeft}-${reverseRight}`;
    let eligiblePatterns = patternsDb.startMap.get(newStartKey)?.filter(pattern => isPatternSuitableForDifficulty(difficulty, pattern));

    if (eligiblePatterns == null || eligiblePatterns.length === 0) {
        console.warn('No patterns found for', newStartKey);
        // Hard reset, will likely require manual intervention
        eligiblePatterns = patternsDb.startMap.get('N-N');
        if (eligiblePatterns == null) {
            throw new Error('Default pattern not found');
        }
    }

    console.info('Found eligible patterns', handsTracker.state.left?.direction, handsTracker.state.right?.direction, eligiblePatterns.length);

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
        currentPattern = pickEligiblePattern(handsTracker, patternsDb, mapDifficulty.difficulty);
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
            lastSourceTime = note.time;

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