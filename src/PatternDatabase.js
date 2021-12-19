// @flow

import type { NotePattern } from "./Analyzer";

import downloadjs from 'downloadjs';

export class PatternDatabase {
    patterns: Array<NotePattern>;

    constructor() {
        this.patterns = [];
    }

    ingest(newPattern: NotePattern): void {
        this.patterns.push(newPattern);
    }

    size(): number {
        return this.patterns.length;
    }

    serialize(): void {
        const data = JSON.stringify(this.patterns, null, 2);
        downloadjs(data, 'patterns.json', 'text/plain');
    }
}