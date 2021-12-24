// @flow

import type { NotePattern } from "./Analyzer";

import { classifyPattern } from "./PatternClassifier";

import downloadjs from 'downloadjs';
import ObjectHash from 'object-hash';

export class PatternDatabase {
    patterns: Map<string, NotePattern>;
    startMap: Map<string, Array<NotePattern>>;
    endMap: Map<string, Array<NotePattern>>;

    constructor() {
        this.patterns = new Map();
        this.startMap = new Map();
        this.endMap = new Map();
        this.ingest({
            notes: [
                {
                    time: 1,
                    column: 1,
                    row: 2,
                    type: 'red',
                    direction: 'N'
                },
                {
                    time: 1,
                    column: 2,
                    row: 2,
                    type: 'blue',
                    direction: 'N'
                }
            ]
        });
        this.recomputeHandidnessMaps();
    }

    computePatternHash(pattern: NotePattern): string {
        return ObjectHash(pattern);
    }

    ingest(newPattern: NotePattern): void {
        classifyPattern(newPattern);
        if (newPattern.classification?.hasBombs) {
            return;
        }
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

    recomputeHandidnessMaps(): void {
        const startMap = new Map<string, Array<NotePattern>>();
        const endMap = new Map<string, Array<NotePattern>>();
        for (let pattern of this.patterns) {
            const p = pattern[1];
            let left = 'X';
            let right = 'X';
            let lastLeft = 'X';
            let lastRight = 'X';
            for (let note of p.notes) {
                if (note.type === 'red' && left === 'X') {
                    left = note.direction;
                }
                if (note.type === 'blue' && right === 'X') {
                    right = note.direction;
                }
                if (note.type === 'red') {
                    lastLeft = note.direction;
                }
                if (note.type === 'blue') {
                    lastRight = note.direction;
                }
            }

            const startHandidness = `${left}-${right}`;
            let prevPatterns: Array<NotePattern> | void = startMap.get(startHandidness);
            if (prevPatterns == null) {
                prevPatterns = [];
            }
            prevPatterns.push(p);
            startMap.set(startHandidness, prevPatterns);

            const endHandidness = `${lastLeft}-${lastRight}`;
            let endPatterns = endMap.get(endHandidness);
            if (endPatterns == null) {
                endPatterns = [];
            }
            endPatterns.push(p);
            endMap.set(endHandidness, endPatterns);
        }

        this.startMap = startMap;
        this.endMap = endMap;
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
            this.recomputeHandidnessMaps();
        } finally {
            onDone();
        }
    }

    clear(): void {
        this.patterns = new Map();
        this.recomputeHandidnessMaps();
    }
}