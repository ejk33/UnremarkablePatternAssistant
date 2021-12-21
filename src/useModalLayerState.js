// @flow

import { useCallback, useState } from "react";

export type ModalLayerState = {
  closeLayer: () => void,
  createLayer: () => number
}

export function useModalLayerState(): ModalLayerState {

    /* eslint-disable */
    const [layersCount, setLayersCount] = useState<{count: number}>({count: 0});
    /* eslint-enable */

    const createLayer = useCallback(() => {
        layersCount.count += 1;
        return layersCount.count;
    }, [layersCount]);

    const closeLayer = useCallback(() => {
        layersCount.count -= 1;
    }, [layersCount]);

    return {
        createLayer,
        closeLayer
    }
}