// @flow

import type { BeatMap } from "./MapArchive";

import { Viewer } from "./Viewer.react";

import React from 'react';

type Props = {
    beatMap: BeatMap
}

export function Editor({beatMap}: Props): React$MixedElement {
    return <Viewer beatMap={beatMap} />;
}