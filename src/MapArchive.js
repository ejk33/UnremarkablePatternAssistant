// @flow

import type { MapDifficulty } from "./MapDifficulty";

import {
  readMapDifficultyFromDifficultyBeatmapInfo,
  serializeMapDifficultyToObj,
} from "./MapDifficulty";

import JSZip from 'jszip';
import downloadjs from 'downloadjs';

export type BeatMap = {
    name: string,
    difficulties: Array<MapDifficulty>,
    archive: any,
    originalFileName: string,
    songBlobData: Blob
}

function readFileToBlob(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve((event.target : any).result);
        }
        reader.readAsArrayBuffer(file);
    });
}

export async function readFromZipArchive(zipFile: File): Promise<BeatMap> {
    const blob = await readFileToBlob(zipFile);
    const zip = await JSZip.loadAsync(blob);

    const infoRaw = await zip.file('Info.dat').async('string');
    const infoObj = JSON.parse(infoRaw);
    const name = infoObj._songName;
    const sets = infoObj._difficultyBeatmapSets;
    const songFileName = infoObj._songFilename;
    const songRawData = await zip.file(songFileName).async('blob');
    const result: BeatMap = {
        name,
        difficulties: [],
        archive: zip,
        originalFileName: zipFile.name,
        songBlobData: songRawData
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

export async function updateAndDownloadZip(beatMap: BeatMap, onDone: () => void): Promise<void> {
    try {
        const zip = beatMap.archive;

        const infoRaw = await zip.file('Info.dat').async('string');
        const infoObj = JSON.parse(infoRaw);
        const sets = infoObj._difficultyBeatmapSets;
        for (let set of sets) {
            if (set._beatmapCharacteristicName === 'Standard') {
                const maps = set._difficultyBeatmaps;
                for (let map of maps) {
                    const mapFileName = map._beatmapFilename;
                    const mapDifficulty = await readMapDifficultyFromDifficultyBeatmapInfo(map, zip);
                    const difficulty = mapDifficulty.difficulty;
                    const sourceNewData = beatMap.difficulties.filter(d => d.difficulty === difficulty)[0];
                    mapDifficulty.notes = sourceNewData.notes;
                    const serializedObj = serializeMapDifficultyToObj(mapDifficulty);
                    zip.remove(mapFileName);
                    zip.file(mapFileName, JSON.stringify(serializedObj));
                }
            }
        }

        const originalName = beatMap.originalFileName;
        const blob = await zip.generateAsync({type:"blob"});
        downloadjs(blob, originalName, 'application/zip');
    } finally {
        onDone();
    }
}