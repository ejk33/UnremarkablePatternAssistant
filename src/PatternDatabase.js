// @flow

import type { NotePattern } from "./Analyzer";

import downloadjs from 'downloadjs';
import ObjectHash from 'object-hash';

export class PatternDatabase {
    patterns: Map<string, NotePattern>;

    constructor() {
        this.patterns = new Map();
    }

    computePatternHash(pattern: NotePattern): string {
        return ObjectHash(pattern);
    }

    ingest(newPattern: NotePattern): void {
        const hash = this.computePatternHash(newPattern);
        this.patterns.set(hash, newPattern);
    }

    size(): number {
        return this.patterns.size;
    }

    serialize(): void {
        const allPatterns = [];
        this.patterns.forEach((value, key) => {
            allPatterns.push(value);
        })
        const data = JSON.stringify(allPatterns, null, 2);
        downloadjs(data, 'patterns.json', 'text/plain');
    }
}