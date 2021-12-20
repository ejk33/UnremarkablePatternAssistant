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
        const allKeys: Array<string> = [];
        const allPatterns: Array<NotePattern> = [];
        this.patterns.forEach((value, key) => {
            allKeys.push(key);
        });
        allKeys.sort();
        for (let key of allKeys) {
            const pattern = this.patterns.get(key);
            if (pattern != null) {
                allPatterns.push(pattern);
            }
        }

        const data = JSON.stringify(allPatterns, null, 2);
        downloadjs(data, 'patterns.json', 'text/plain');
    }

    async loadFromServer(onDone: () => void): Promise<void> {
        try {
            const request = await fetch('/patterns.json', {
                method: 'GET'
            });
            const response: Array<NotePattern> = await request.json();
            for (let pattern of response) {
                this.ingest(pattern);
            }
        } finally {
            onDone();
        }
    }
}