// @flow

import type { BeatMap } from "./MapArchive";

import React from 'react';
import { useEffect, useMemo, useState } from "react";
import * as WaveSurfer from 'wavesurfer.js';
import ReactDOM from 'react-dom';
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

function Measures({position}: MeasuresProps): React$MixedElement | null {
    const containerRef = React.createRef();
    useEffect(() => {
        const node = containerRef.current;
        if (node == null) {
            return;
        }
        // const startPosition = scroll;
        // const endPosition = scroll + node.offsetWidth;
        // const pxPerMin = 60 * VIEWER_PX_PER_SEC;
        // const beatsPerPx = bpm / pxPerMin;
        // const startBeat = Math.floor(beatsPerPx * startPosition);
        // const endBeat = Math.ceil(beatsPerPx * endPosition) + 1;
        // const pxPerBeat = pxPerMin / bpm;
        const startBeat = position.beat - 1;
        
        const beatReactNodes = [];
        for (let beat = startBeat; beat <= endBeat; beat++) {
            const absPxPosition = pxPerBeat * beat;
            const relPxPosition = absPxPosition - startPosition;
            console.info('Rendering a beat', {
                beat: beat,
                absposition: absPxPosition,
                relPxPosition
            })
            const beatStyle = {
                ...styles.beatBar,
                left: relPxPosition
            };
            beatReactNodes.push(<div style={beatStyle} key={beat}></div>);
        }
        ReactDOM.render(<>{beatReactNodes}</>, node);
        return () => {
            ReactDOM.unmountComponentAtNode(node);
        }
    }, [scroll, bpm, containerRef]);
    return (
        <div ref={containerRef} style={styles.measuresContainer}></div>
    );
}

export function Viewer({beatMap}: Props): React$MixedElement | null {
    const audioPosition = useMemo(() => {
        return new AudioPosition(beatMap.bpm);
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

    /* eslint-disable */
    const [mainPlayer, setMainPlayer] = useState<any>(null);
    /* eslint-enable */

    useEffect(() => {
        setMainPlayer(() => {
            return createWaveSurfer('#waveform', beatMap);
        });
    }, [beatMap]); 

    // const onPlay = useCallback(() => {
    //     mainPlayer.play();
    // }, [mainPlayer]);

    return (
        <div style={styles.container} id="viewer-container">
            <Measures bpm={beatMap.bpm} scroll={0} cursorPosition={0} />
            <div id="waveform"></div>
            <div id="waveform-low"></div>
        </div>
    );
}