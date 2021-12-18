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
    originalRawObject: any
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

function parseNote(rawNote: any): Note {
    return {
        time: rawNote._time,
        column: parseNoteColumn(rawNote._lineIndex),
        row: parseNoteRow(rawNote._lineLayer),
        type: parseNoteType(rawNote._type),
        direction: parseNoteDirection(rawNote._cutDirection)
    }
}

function readFileToString(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve((event.target : any).result);
        }
        reader.readAsText(file, 'UTF-8');
    });
}

export async function readMapDifficultyFromFile(file: File): Promise<MapDifficulty> {
    const text = await readFileToString(file);
    const rawObject = JSON.parse(text);
    return {
        difficulty: 9, // TODO
        notes: rawObject._notes.map(rawNote => parseNote(rawNote)),
        originalRawObject: rawObject
    }
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