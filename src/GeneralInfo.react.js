// @flow

import type { BeatMap } from "./MapArchive";
import type { MapDifficulty } from "./MapDifficulty";

import type { ModalLayerState } from "./useModalLayerState";

import { FullModal } from "./FullModal.react";

import React from 'react';
import { useCallback, useState } from "react";

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
    button: {
        margin: '8px',
        padding: '8px'
    }
}

type Props = {
    beatMap: ?BeatMap,
    modalLayerState: ModalLayerState,
    onAnalyzeClick: (mapDifficulty: MapDifficulty) => void,
    onReMapClick: (mapDifficulty: MapDifficulty) => void,
}

export default function GeneralInfo({beatMap, modalLayerState, onAnalyzeClick, onReMapClick}: Props): React$MixedElement | null {
    const [isEditorOpen, setEditorOpen] = useState(false);

    const onOpenEditorClick = useCallback(() => {
        setEditorOpen(true);
    }, []);
    const onEditorClose = useCallback(() => {
        setEditorOpen(false);
    }, []);

    if (beatMap == null) {
        return null;
    }

    return (
        <div style={styles.box}>
            {
                isEditorOpen && (
                    <FullModal onClose={onEditorClose} modalLayerState={modalLayerState}>
                        <div>The editor</div>
                    </FullModal>
                )
            }
            <button style={styles.button} onClick={onOpenEditorClick}>Open editor</button>
            <div style={styles.text}>Map loaded</div>
            <div style={styles.text}>Title: {beatMap.name}</div>
            <div style={styles.text}>Difficulties:</div>
            {
                beatMap.difficulties.map(mapDifficulty => {
                    return <div style={styles.hbox} key={mapDifficulty.difficulty}>
                        <div style={styles.text}>Difficulty: {mapDifficulty.difficulty}. Notes: {mapDifficulty.notes.length}</div>
                        <button style={styles.button} onClick={() => {onAnalyzeClick(mapDifficulty)}}>Analyze</button>
                        <button style={styles.button} onClick={() => {onReMapClick(mapDifficulty)}}>ReMap</button>
                    </div>;
                })
            }
        </div>
    );
}