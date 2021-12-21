// @flow

import type { ModalLayerState } from "./useModalLayerState";

import React from 'react';
import { useEffect, useState } from "react";

type Props = {
    modalLayerState: ModalLayerState,
    children: React$Node,
    onClose: () => void,
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
    },
    closeButton: {
        padding: '16px',
        cursor: 'pointer',
        flexGrow: 0,
        flexShrink: 0,
        alignSelf: 'flex-end'
    }
}

export function FullModal({modalLayerState, children}: Props): React$MixedElement | null {
    const [layerNumber, setLayerNumber] = useState<number | null>(null);
    useEffect(() => {
        setLayerNumber(() => {
            return modalLayerState.createLayer();
        })
        return () => {
            modalLayerState.closeLayer();
        }
    }, []);

    if (layerNumber == null) {
        return null;
    }

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: layerNumber,
        backgroundColor: 'white',
    }

    return (
        <div style={overlayStyle}>
            <div style={styles.closeButton}>CLOSE</div>
            {children}
        </div>
    );
}