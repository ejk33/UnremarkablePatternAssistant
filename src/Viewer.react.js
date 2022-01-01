// @flow

import type { BeatMap } from "./MapArchive";

import React from 'react';
import { useEffect, useMemo, useState } from "react";
import * as WaveSurfer from 'wavesurfer.js';
import { AudioPosition } from "./AudioPosition";
import type { AudioPositionPublicState } from "./AudioPosition";

export const VIEWER_PX_PER_SEC = 250;

// - visible container 100vw -
// -------------- outer container 200vw ------------
// -pad50- --inner container 100- -pad50-
//         -- waveform100 -------
//         -- measures100 -------
//         -- cursor100 ---------

type Props = {
    beatMap: BeatMap
}

const styles = {
    visibleContainer: {
        height: 600,
        width: '100vw',
        overflow: 'hidden'
    },
    outerContainer: {
        height: 600,
        width: '200vw',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'row'
    },
    pad: {
        width: '50vw',
        flexGrow: 0,
        flexShrink: 0
    },
    innerContainer: {
        width: '100vw',
        flexGrow: 0,
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative'
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

let idCounter = 0;

function useUniqueId(): string {
    const id = useMemo(() => {
        idCounter += 1;
        return `generatedId${idCounter}`;
    }, []);
    return id;
}

function secToPx(sec: number) {
    return VIEWER_PX_PER_SEC * sec;
}

type ScrollData = {
    visibleContainerScroll: number,
    innerScroll: number
};

function getScrollData(positionSeconds: number, viewportWidth: number, audioDuration: number): ScrollData {
    const positionPx = secToPx(positionSeconds);
    const durationPx = secToPx(audioDuration);
    const halfWidthPx = viewportWidth / 2;

    // left
    if (positionPx < halfWidthPx) {
        // ------------------ viewport -----------------------
        // ------------pad ------ --------audio --------------

        // ------------------ viewport -----------------------
        // --- pad --- ----------------audio------------------

        return {
            visibleContainerScroll: positionPx,
            innerScroll: 0
        }
    }

    // right
    else if (positionPx > (durationPx - halfWidthPx)) {
        // ------------------ viewport -----------------------
        // ----audio-------------- -----pad-------------------
        // visibleContainer is scrolled to: viewportWidth

        // ------------------ viewport -----------------------
        // ------------------------------audio---- -pad-------
        // visibleContainer is scrolled to: viewportWidth - remaining audio

        return {
            visibleContainerScroll: viewportWidth - (durationPx - positionPx),
            innerScroll: durationPx - viewportWidth
        };
    }

    // middle
    else {
        return {
            visibleContainerScroll: halfWidthPx,
            innerScroll: positionPx
        }
    }
}

function Waveform({beatMap, scrollData, onReady}: {
    beatMap: BeatMap,
    scrollData: ?ScrollData,
    onReady: (duration: number) => void
}) {
    const waveformId = useUniqueId();

    const [state] = useState<{waveSurfer: any}>({
        waveSurfer: null
    });

    useEffect(() => {
        const element = document.getElementById(waveformId);
        if (element == null) {
            return;
        }
        const surfer = createWaveSurfer('#' + waveformId, beatMap);
        state.waveSurfer = surfer;
        surfer.on('ready', () => {
            onReady(surfer.getDuration());
        });
    }, [waveformId, beatMap, onReady, state]);

    useEffect(() => {
        const element = document.getElementById(waveformId);
        if (element == null || scrollData == null) {
            return;
        }

        const waveElement = element.firstChild;
        if (waveElement == null) {
            return;
        }

        if (waveElement instanceof HTMLElement) {
            waveElement.scrollTo(scrollData.innerScroll, 0);
        }
    }, [scrollData, waveformId]);

    return <div id={waveformId}></div>;
}

export function Viewer({beatMap}: Props): React$MixedElement | null {
    const audioPosition = useMemo(() => {
        return new AudioPosition(beatMap.bpm, 1);
    }, [beatMap.bpm]);

    const visibleContainerId = useUniqueId();

    const [audioPositionState, setAudioPositionState] = useState<AudioPositionPublicState>(audioPosition.getStateCopy());

    const [audioDuration, setAudioDuration] = useState<?number>(null);
    useEffect(() => {
        if (audioDuration != null) {
            audioPosition.setLength(audioDuration);
        }
    }, [audioDuration, audioPosition]);

    const [viewportWidth, setViewportWidth] = useState<number>(0);

    useEffect(() => {
        setAudioPositionState(audioPosition.getStateCopy());
    }, [audioPosition]);

    useEffect(() => {
        const visibleContainer = document.getElementById(visibleContainerId);
        if (visibleContainer == null) {
            return;
        }
        setViewportWidth(visibleContainer.offsetWidth);
        // $FlowFixMe
        visibleContainer.addEventListener('mousewheel', (event) => {
            if (event.deltaY > 0) {
                audioPosition.backward();
            }
            if (event.deltaY < 0) {
                audioPosition.forward();
            }
            const audioPositionState = audioPosition.getStateCopy();
            setAudioPositionState(audioPositionState);
        }, false);
    }, [visibleContainerId, audioPosition]);

    const [scrollData, setScrollData] = useState(null)

    useEffect(() => {
        const scrollData = getScrollData(audioPositionState.preciseTimeSeconds, viewportWidth, audioPositionState.length);
        setScrollData(scrollData);
        const visibleContainer = document.getElementById(visibleContainerId);
        if (visibleContainer == null) {
            return;
        }
        visibleContainer.scrollTo(scrollData.visibleContainerScroll, 0);
    }, [audioPositionState, viewportWidth, visibleContainerId]);

    return (
        <div id={visibleContainerId} style={styles.visibleContainer}>
            <div style={styles.outerContainer}>
                <div style={styles.pad}></div>
                <div style={styles.innerContainer}>
                    <Waveform beatMap={beatMap} scrollData={scrollData} onReady={setAudioDuration} />
                </div>
                <div style={styles.pad}></div>
            </div>
        </div>
    );
}