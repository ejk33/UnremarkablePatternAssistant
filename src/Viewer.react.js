// @flow

import type { BeatMap } from "./MapArchive";

import React from 'react';
import { lazy, useCallback, useEffect, useState } from "react";
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

type FilterType = 'low' | 'mid' | 'high';

function createFilters(wavesurfer: any, type: FilterType): Array<any> | null {
    const ac: BaseAudioContext = wavesurfer.backend.ac;
    if (type === 'low') {
        const filter = ac.createBiquadFilter();
        filter.frequency.setValueAtTime(250, 0);
        filter.type = 'lowpass';
        return [filter];
    }

    return null;
}

function createWaveSurfer(domSelector: string, beatMap: BeatMap): any {
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
    // const filters = createFilters(wavesurfer, type);
    // if (filters != null) {
    //     wavesurfer.backend.setFilter(filters[0]);
    // }
    wavesurfer.loadBlob(beatMap.songBlobData);
    wavesurfer.zoom(VIEWER_PX_PER_SEC);
    return wavesurfer;
}

// async function createFilteredWaveSurfer(mainWaveSurfer: any, beatMap: BeatMap): Promise<void> {
//     let tmpDiv = null;
//     try {
//         await new Promise((resolve) => {
//             console.info('Creating filtered wave surfer');
//             tmpDiv = document.createElement('div');
//             const tmpId = 'tmpwavesurfer';
//             tmpDiv.id = tmpId;
//             document.body?.appendChild(tmpDiv);

//             const tmpWave = WaveSurfer.create({
//                 container: `#${tmpId}`,
//             });
//             const ac: BaseAudioContext = tmpWave.backend.ac;
//             const filter = ac.createBiquadFilter();
//             filter.frequency.setValueAtTime(250, 0);
//             filter.type = 'lowpass';
//             tmpWave.backend.setFilter(filter);
//             tmpWave.loadBlob(beatMap.songBlobData);
//             tmpWave.on('ready', () => {
//                 console.info('tmp wave ready');
//                 // $FlowFixMe
//                 const offlineCtx = new OfflineAudioContext({
//                     numberOfChannels: 2,
//                     length: Math.ceil(44100 * mainWaveSurfer.getDuration()),
//                     sampleRate: 44100,
//                 });
//                 console.info('offline ctx made');
//                 const source = offlineCtx.createBufferSource();

//                 ac.createBuffer()
//                 ac.decodeAudioData(buffer => {
                    
//                 })

//                 source.connect(offlineCtx.destination);
//                 source.start();
//                 console.info('rendering starting');
//                 offlineCtx.startRendering().then(renderedBuffer => {
//                     console.info('Rendering completed');
//                     const wavesurfer = WaveSurfer.create({
//                         container: '#waveform-low',
//                         scrollParent: true,
//                         autoCenter: false,
//                         partialRender: true,
//                         removeMediaElementOnDestroy: true,
//                         hideCursor: true,
//                         interact: false,
//                         hideScrollbar: true,
//                         progressColor: '#555',
//                         waveColor: '#555',
//                         cursorWidth: 0
//                     });
//                     console.info('Loading from rendered buffer');
//                     wavesurfer.loadBlob(renderedBuffer);
//                     wavesurfer.on('ready', () => {
//                         console.info('modified surfer ready');
//                     });
//                     wavesurfer.on('error', err => {
//                         console.info(err);
//                     });
//                 }).catch(err => {
//                     console.info('error in startRendering', err);
//                 })

//                 const pcm = tmpWave.exportPCM();
//                 console.info(pcm);
//                 // resolve();
//             });
//         });
//     } finally {
//         if (tmpDiv != null) {
//             // document.body?.removeChild(tmpDiv);
//         }
//     }
// }

async function createFilteredWaveSurfer(mainPlayer: any, beatMap: BeatMap): Promise<void> {
    let audioCtx = new AudioContext();
    // $FlowFixMe
    let offlineCtx = new OfflineAudioContext(2, Math.ceil(44100*mainPlayer.getDuration()), 44100);
    let source = offlineCtx.createBufferSource();
    // $FlowFixMe
    audioCtx.decodeAudioData(beatMap.songBlobData, function(buffer) {
        source.buffer = buffer;
        source.connect(offlineCtx.destination);
        source.start();
        offlineCtx.startRendering().then(function(renderedBuffer) {
            console.info('Rendering done');
        });
        
    });
}

export function Viewer({beatMap}: Props): React$MixedElement | null {
    const [mainPlayer, setMainPlayer] = useState<any>(null);

    useEffect(() => {
        setMainPlayer(() => {
            const mainPlayer = createWaveSurfer('#waveform', beatMap);
            createFilteredWaveSurfer(mainPlayer, beatMap);
            return mainPlayer;
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