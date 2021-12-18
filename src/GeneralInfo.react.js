// @flow

import type { BeatMap } from "./MapArchive";
import React from 'react';

const styles = {
    box: {
        display: 'flex',
        flexDirection: 'column',
    },
    text: {
        padding: '16px'
    }
}

type Props = {
    beatMap: BeatMap | null
}

export default function GeneralInfo({beatMap}: Props): React$MixedElement | null {
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
                    return <div style={styles.text} key={mapDifficulty.difficulty}>Difficulty: {mapDifficulty.difficulty}. Notes: {mapDifficulty.notes.length}</div>;
                })
            }
        </div>
    );
}