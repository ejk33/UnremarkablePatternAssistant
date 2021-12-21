// @flow

import type { BeatMap } from "./MapArchive";

import React from 'react';
import { useEffect } from "react";
import * as WaveSurfer from 'wavesurfer.js';

type Props = {
    beatMap: BeatMap
}

const styles = {
    waveviewer: {
        width: '100%',
        height: '400px'
    }
}

export function Viewer({beatMap}: Props): React$MixedElement | null {
    useEffect(() => {
        var wavesurfer = WaveSurfer.create({
            container: '#waveform',
            scrollParent: true
        });
        wavesurfer.loadBlob(beatMap.songBlobData);
        wavesurfer.on('ready', () => {
            console.info('<><><> wavesurfer ready');
        })
    }, [beatMap]); 

    return <div id="waveform"></div>;
}