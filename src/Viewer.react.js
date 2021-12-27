// @flow

import type { BeatMap } from "./MapArchive";

import React from 'react';
import { useCallback, useEffect, useMemo, useState } from "react";
import * as WaveSurfer from 'wavesurfer.js';
import { AudioPosition } from "./AudioPosition";
import type { AudioPositionPublicState } from "./AudioPosition";

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
        position: 'relative'
    },
    measuresContainer: {
        width: '100%',
        height: '400px',
        position: 'absolute',
        overflow: 'hidden',
        top: 0,
        left: 0
    },
    beatBar: {
        height: '400px',
        width: '1px',
        backgroundColor: '#afafaf',
        position: 'absolute',
        top: 0
    },
    beatNumber: {
        position: 'absolute',
        top: 0
    }
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
    wavesurfer.loadBlob(beatMap.songBlobData);
    wavesurfer.zoom(VIEWER_PX_PER_SEC);
    return wavesurfer;
}

type MeasuresProps = {
    position: AudioPositionPublicState
}

let idCounter = 0;

function Measures({position}: MeasuresProps): React$MixedElement | null {
    const containerNumber = useMemo(() => {
        idCounter += 1;
        return idCounter;
    }, []);
    const containerId = `autoid${containerNumber}`;

    const [node, setNode] = useState(null);
    useEffect(() => {
        setNode(document.getElementById(containerId));
    }, [containerId]);

    const children = (() => {
        if (node == null) {
            return null;
        }
        const viewerPxWidth = node.offsetWidth;
        const halfPxOffset = viewerPxWidth / 2;
        const halfSecOffset = halfPxOffset / VIEWER_PX_PER_SEC;
        const startSec = position.preciseTimeSeconds - halfSecOffset;
        const beatsPerSec = position.bpm / 60;
        const secPerBeat = 1 / beatsPerSec;
        const pxPerBeat = secPerBeat * VIEWER_PX_PER_SEC;
        const startBeat = startSec * beatsPerSec;
        const startPxPosition = startSec * VIEWER_PX_PER_SEC;
        console.info({
            startSec, beatsPerSec, secPerBeat, startBeat, startPxPosition
        });

        const beatReactNodes = [];
        let currentBeat = startBeat;
        while (true) {
            const absPxPosition = pxPerBeat * currentBeat;
            const relPxPosition = absPxPosition - startPxPosition;
            if (relPxPosition > viewerPxWidth) {
                break;
            }

            const beatStyle = {
                ...styles.beatBar,
                left: relPxPosition
            };
            beatReactNodes.push(<div style={beatStyle} key={currentBeat}></div>);

            const beatNumberStyle= {
                ...styles.beatNumber,
                left: relPxPosition
            };
            beatReactNodes.push(<div style={beatNumberStyle} key={`num-${currentBeat}`}>{currentBeat.toFixed(2)}</div>);

            currentBeat += 1;
        }
        return beatReactNodes;
    })();

    return (
        <div id={containerId} style={styles.measuresContainer}>{children}</div>
    );
}

type WaveformProps = {
    beatMap: BeatMap,
    onLoaded: (length: number) => void
}

function Waveform({beatMap, onLoaded}: WaveformProps): React$MixedElement | null {
    /* eslint-disable */
    const [mainPlayer, setMainPlayer] = useState<any>(null);
    /* eslint-enable */

    useEffect(() => {
        setMainPlayer(() => {
            const surfer = createWaveSurfer('#waveform', beatMap);
            surfer.on('ready', () => {
                onLoaded(surfer.getDuration());
            });
            return surfer;
        });
    }, [beatMap, onLoaded]); 

    return <div id="waveform"></div>;
}

const WaveformMemo = React.memo(Waveform);

export function Viewer({beatMap}: Props): React$MixedElement | null {
    const audioPosition = useMemo(() => {
        return new AudioPosition(beatMap.bpm, 1);
    }, [beatMap.bpm]);

    const [audioPositionState, setAudioPositionState] = useState<AudioPositionPublicState>(audioPosition.getStateCopy());

    useEffect(() => {
        setAudioPositionState(audioPosition.getStateCopy());
    }, [audioPosition]);

    useEffect(() => {
        const container = document.getElementById('viewer-container');
        if (container == null) {
            return;
        }

        // $FlowFixMe
        container.addEventListener('mousewheel', (event) => {
            if (event.deltaY > 0) {
                audioPosition.backward();
            }
            if (event.deltaY < 0) {
                audioPosition.forward();
            }
            setAudioPositionState(audioPosition.getStateCopy());
        }, false);
    }, [audioPosition]);

    const onSongLoaded = useCallback((length: number) => {
        audioPosition.setLength(length);
    }, [audioPosition]);

    return (
        <div style={styles.container} id="viewer-container">
            <Measures position={audioPositionState} />
            <WaveformMemo beatMap={beatMap} onLoaded={onSongLoaded} />
        </div>
    );
}