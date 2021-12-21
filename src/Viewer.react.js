// @flow

import type { BeatMap } from "./MapArchive";

import React from 'react';
import { useCallback, useEffect, useState } from "react";
import * as WaveSurfer from 'wavesurfer.js';

export const VIEWER_PX_PER_SEC = 250;

type Props = {
    beatMap: BeatMap
}

const styles = {
    waveviewer: {
        width: '100%',
        height: '200px'
    },
    container: {
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    }
}

type FilterType = 'main' | 'low' | 'mid' | 'high';

function createFilters(wavesurfer: any, type: FilterType): Array<any> | null {
    if (type === 'main') {
        return null;
    }
    const ac: BaseAudioContext = wavesurfer.backend.ac;
    if (type === 'low') {
        const filter = ac.createBiquadFilter();
        filter.frequency.setValueAtTime(250, 0);
        filter.type = 'lowpass';
        return [filter];
    }

    return null;
}

function createWaveSurfer(domSelector: string, beatMap: BeatMap, type: FilterType): any {
    const wavesurfer = WaveSurfer.create({
        container: domSelector,
        scrollParent: true,
        autoCenter: false,
        partialRender: true,
        removeMediaElementOnDestroy: true,
        hideCursor: true,
        interact: false,
        hideScrollbar: true,
        progressColor: '#555',
        waveColor: '#555',
        cursorWidth: 0
    });
    const filters = createFilters(wavesurfer, type);
    if (filters != null) {
        wavesurfer.backend.setFilter(filters[0]);
    }
    wavesurfer.loadBlob(beatMap.songBlobData);
    wavesurfer.zoom(VIEWER_PX_PER_SEC);
    return wavesurfer;
}

export function Viewer({beatMap}: Props): React$MixedElement | null {
    const [mainPlayer, setMainPlayer] = useState<any>(null);

    useEffect(() => {
        setMainPlayer(() => {
            createWaveSurfer('#waveform', beatMap, 'main');
            createWaveSurfer('#waveform-low', beatMap, 'low');
        });
    }, [beatMap]); 

    const onPlay = useCallback(() => {
        mainPlayer.play();
    }, [mainPlayer]);

    return (
        <div style={styles.container}>
            <div id="waveform"></div>
            <div id="waveform-low"></div>
            <button onClick={onPlay}>Play</button>
        </div>
    );
}