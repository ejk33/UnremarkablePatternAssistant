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
        height: '400px'
    },
    container: {
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    }
}

export function Viewer({beatMap}: Props): React$MixedElement | null {
    const [wavesurfer, setWavesurfer] = useState<any>(null);

    useEffect(() => {
        let wavesurfer = null;
        setWavesurfer(() => {
            wavesurfer = WaveSurfer.create({
                container: '#waveform',
                scrollParent: true,
                autoCenter: false
            });
            wavesurfer.loadBlob(beatMap.songBlobData);
            wavesurfer.zoom(VIEWER_PX_PER_SEC);
            return wavesurfer;
        });
        return () => {
            if (wavesurfer != null) {
                wavesurfer.destroy();
            }
        }
    }, [beatMap]); 

    const onPlay = useCallback(() => {
        wavesurfer.play();
    }, [wavesurfer]);

    return (
        <div style={styles.container}>
            <div id="waveform"></div>
            <button onClick={onPlay}>Play</button>
        </div>
    );
}