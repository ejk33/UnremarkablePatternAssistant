// @flow

import type { BeatMap } from "./MapArchive";
import type { MapDifficulty } from "./MapDifficulty";

import React from 'react';

const styles = {
    box: {
        display: 'flex',
        flexDirection: 'column',
    },
    hbox: {
        display: 'flex',
        flexDirection: 'row',
    },
    text: {
        padding: '16px'
    },
}

type Props = {
    beatMap: BeatMap | null,
    onAnalyzeClick: (mapDifficulty: MapDifficulty) => void,
    onReMapClick: (mapDifficulty: MapDifficulty) => void,
}

export default function GeneralInfo({beatMap, onAnalyzeClick, onReMapClick}: Props): React$MixedElement | null {
    if (beatMap == null) {
        return null;
    }
    return (
        <div style={styles.box}>
            <div style={styles.text}>Map loaded</div>
            <div style={styles.text}>Title: {beatMap.name}</div>
            <div style={styles.text}>Difficulties:</div>
            {
                beatMap.difficulties.map(mapDifficulty => {
                    return <div style={styles.hbox} key={mapDifficulty.difficulty}>
                        <div style={styles.text}>Difficulty: {mapDifficulty.difficulty}. Notes: {mapDifficulty.notes.length}</div>
                        <button onClick={() => {onAnalyzeClick(mapDifficulty)}}>Analyze</button>
                        <button onClick={() => {onReMapClick(mapDifficulty)}}>ReMap</button>
                    </div>;
                })
            }
        </div>
    );
}