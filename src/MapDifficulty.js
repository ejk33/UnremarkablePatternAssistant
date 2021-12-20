// @flow

export type NoteDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'DOT';
export type NoteType = 'red' | 'blue' | 'bomb';
export type NoteColumn = 0 | 1 | 2 | 3; // left to right
export type NoteRow = 0 | 1 | 2;  // bot to top
export type Difficulty = 1 | 3 | 5 | 7 | 9; // From Easy to Expert+

export type Note = {
    time: number,
    column: NoteColumn,
    row: NoteRow,
    type: NoteType,
    direction: NoteDirection
}

export type MapDifficulty = {
    difficulty: Difficulty,
    notes: Array<Note>,
    originalRawObject: any,
}

export function reverseDirection(direction: NoteDirection): NoteDirection {
    switch (direction) {
        case 'N':
            return 'S';
        case 'NE':
            return 'SW';
        case 'E':
            return 'W';
        case 'SE':
            return 'NW';
        case 'S':
            return 'N';
        case 'SW':
            return 'NE';
        case 'W':
            return 'E';
        case 'NW':
            return 'SE';
        default:
            return 'S';
    }
}

function directionToDirectionIndex(direction: NoteDirection): number {
    switch (direction) {
        case 'N':
            return 0;
        case 'NE':
            return 1;
        case 'E':
            return 2;
        case 'SE':
            return 3;
        case 'S':
            return 4;
        case 'SW':
            return 5;
        case 'W':
            return 6;
        case 'NW':
            return 7;
        case 'DOT':
            return -1;
        default:
            throw new Error('Invalid direction value');
    }
}

export function directionsMinimumAbsDifference(a: NoteDirection, b: NoteDirection): number {
    if (a === 'DOT' || b === 'DOT') {
        return 0;
    }
    const ai = directionToDirectionIndex(a);
    const bi = directionToDirectionIndex(b);
    const x = ai < bi ? ai : bi;
    const y = ai < bi ? bi : ai;
    return Math.abs(Math.min((y - x), (x+8 - y)));
}

function parseDifficulty(rawDifficulty: any): Difficulty {
    switch (rawDifficulty) {
        case 1:
            return 1;
        case 3:
            return 3;
        case 5:
            return 5;
        case 7:
            return 7;
        case 9:
            return 9;
        default:
            throw new Error('Unrecognized difficulty value');
    }
}

function parseNoteDirection(rawNoteDirection: any): NoteDirection {
    switch (rawNoteDirection) {
        case 0:
            return 'N';
        case 1:
            return 'S';
        case 2:
            return 'W';
        case 3:
            return 'E';
        case 4:
            return 'NW';
        case 5:
            return 'NE';
        case 6:
            return 'SW';
        case 7:
            return 'SE';
        case 8:
            return 'DOT';
        default:
            throw new Error('Unrecognized note direction');
    }
}

function serializeNoteDirection(noteDirection: NoteDirection): number {
    switch (noteDirection) {
        case 'N':
            return 0;
        case 'S':
            return 1;
        case 'W':
            return 2;
        case 'E':
            return 3;
        case 'NW':
            return 4;
        case 'NE':
            return 5;
        case 'SW':
            return 6;
        case 'SE':
            return 7;
        case 'DOT':
            return 8;
        default:
            throw new Error('Unrecognized note direction');
    }
}

function parseNoteType(rawNoteType: any): NoteType {
    switch (rawNoteType) {
        case 0:
            return 'red';
        case 1:
            return 'blue';
        case 2:
            throw new Error('Note type 2 is unused');
        case 3:
            return 'bomb';
        default:
            throw new Error('Unrecognized note type');
    }
}

function serializeNoteType(noteType: NoteType): number {
    switch (noteType) {
        case 'red':
            return 0;
        case 'blue':
            return 1;
        case 'bomb':
            return 3
        default:
            throw new Error('Unrecognized note type');
    }
}

function parseNoteColumn(lineIndex: any): NoteColumn {
    switch (lineIndex) {
        case 0:
            return 0;
        case 1:
            return 1;
        case 2:
            return 2;
        case 3:
            return 3;
        default:
            throw new Error('Unrecognized line index');
    }
}

function serializeNoteColumn(noteColumn: NoteColumn): number {
    switch (noteColumn) {
        case 0:
            return 0;
        case 1:
            return 1;
        case 2:
            return 2;
        case 3:
            return 3;
        default:
            throw new Error('Unrecognized Note Column');
    }
}

function parseNoteRow(lineLayer: any): NoteRow {
    switch (lineLayer) {
        case 0:
            return 0;
        case 1:
            return 1;
        case 2:
            return 2;
        default:
            throw new Error('Unrecognized line layer');    
    }
}

function serializeNoteRow(noteRow: NoteRow): number {
    switch (noteRow) {
        case 0:
            return 0;
        case 1:
            return 1;
        case 2:
            return 2;
        default:
            throw new Error('Unrecognized note row');  
    }
}

function parseNote(rawNote: any): Note {
    return {
        time: rawNote._time,
        column: parseNoteColumn(rawNote._lineIndex),
        row: parseNoteRow(rawNote._lineLayer),
        type: parseNoteType(rawNote._type),
        direction: parseNoteDirection(rawNote._cutDirection)
    }
}

function serializeNote(note: Note): any {
    return {
        _time: note.time,
        _lineIndex: serializeNoteColumn(note.column),
        _lineLayer: serializeNoteRow(note.row),
        _type: serializeNoteType(note.type),
        _cutDirection: serializeNoteDirection(note.direction)
    }
}

export function serializeMapDifficultyToObj(mapDifficulty: MapDifficulty): any {
    const serializedNotes = mapDifficulty.notes.map(note => serializeNote(note));
    const rawObj = mapDifficulty.originalRawObject;
    rawObj._notes = serializedNotes;
    return rawObj;
}

export async function readMapDifficultyFromDifficultyBeatmapInfo(info: any, zip: any): Promise<MapDifficulty> {
    const difficulty = parseDifficulty(info._difficultyRank);
    const fileName = info._beatmapFilename;
    const beatMapFileStr = await zip.file(fileName).async('string');
    const rawObject = JSON.parse(beatMapFileStr);
    return {
        difficulty,
        notes: rawObject._notes.map(rawNote => parseNote(rawNote)),
        originalRawObject: rawObject
    }
}