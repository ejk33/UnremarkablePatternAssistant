// @flow

import type { MapDifficulty } from "./MapDifficulty";

import { readMapDifficultyFromDifficultyBeatmapInfo } from "./MapDifficulty";

import JSZip from 'jszip';

export type BeatMap = {
    name: string,
    difficulties: Array<MapDifficulty>
}

export async function readFromZipArchive(zipFile: File): Promise<BeatMap> {
    const zip = await JSZip.loadAsync(zipFile);
    let contents = [];
    zip.forEach((relativePath, _zipEntry) => {
        contents.push(relativePath);
    });

    const infoRaw = await zip.file('Info.dat').async('string');
    const infoObj = JSON.parse(infoRaw);
    const name = infoObj._songName;
    const sets = infoObj._difficultyBeatmapSets;
    const result: BeatMap = {
        name,
        difficulties: []
    };
    for (let set of sets) {
        if (set._beatmapCharacteristicName === 'Standard') {
            const maps = set._difficultyBeatmaps;
            for (let map of maps) {
                const mapDifficulty = await readMapDifficultyFromDifficultyBeatmapInfo(map, zip);
                result.difficulties.push(mapDifficulty);
            }
        }
    }
    return result;
}