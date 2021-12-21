// @flow

import { useCallback, useState } from "react";

export type ModalLayerState = {
  closeLayer: () => void,
  createLayer: () => number
}

export function useModalLayerState(): ModalLayerState {

    /* eslint-disable */
    const [layersCount, setLayersCount] = useState<number>(0);
    /* eslint-enable */

    const createLayer = useCallback(() => {
        let newLayerIndex = -1;
        setLayersCount(oldCount => {
            newLayerIndex = oldCount + 1;
            return newLayerIndex;
        })
        return newLayerIndex;
    }, [setLayersCount]);

    const closeLayer = useCallback(() => {
        setLayersCount(oldCount => {
            return oldCount - 1;
        })
    }, []);

    return {
        createLayer,
        closeLayer
    }
}