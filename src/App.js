// @flow

import type { BeatMap } from "./MapArchive";

import { analyzeMapPatterns } from "./Analyzer";
import FileInput from "./FileInput.react";

import GeneralInfo from "./GeneralInfo.react";
import { readFromZipArchive, updateAndDownloadZip } from "./MapArchive";

import { PatternDatabase } from "./PatternDatabase";

import { ReMap } from "./ReMapper";

import { useModalLayerState } from "./useModalLayerState";

import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

const styles = {
  container: {
    padding: '16px'
  },
  text: {
    padding: '16px'
  },
  button: {
    padding: '16px'
  }
}

function Header(): React$MixedElement {
  return <h1>UNREMARKABLE PATTERN ASSISTANT</h1>;
}

async function processFile(file: File, setBeatMap, onDone: () => void) {
  try {
    const beatMap = await readFromZipArchive(file);
    setBeatMap(beatMap);
  } finally {
    onDone();
  }
}

function App(): React$MixedElement {
  const modalLayerState = useModalLayerState();
  const [beatMap, setBeatMap] = useState<?BeatMap>(null);
  const [lastAnalysisOutput, setLastAnalysisOutput] = useState(null);
  const [dbLoaded, setDbLoaded] = useState(false);
  const patternDatabase = useMemo(() => {
    return new PatternDatabase();
  }, []);

  useEffect(() => {
    patternDatabase.loadFromServer(() => {
      setDbLoaded(true);
    });
  }, [patternDatabase, setDbLoaded]);

  const [loadingFile, setLoadingFile] = useState(false);
  const onFilesChange = useCallback((file) => {
    setLoadingFile(true);
    processFile(file, setBeatMap, () => {setLoadingFile(false)});
  }, []);

  const onAnalyzeClick = useCallback((mapDifficulty) => {
    const groups = analyzeMapPatterns(mapDifficulty);
    for (let group of groups) {
      patternDatabase.ingest(group);
      patternDatabase.recomputeHandidnessMaps();
    }
    setLastAnalysisOutput(groups.length);
  }, [patternDatabase, setLastAnalysisOutput]);

  const onReMapClick = useCallback((mapDifficulty) => {
    ReMap(mapDifficulty, patternDatabase);
    setBeatMap(beatMap => {
      return beatMap == null ? null : {
        ...beatMap
      }
    })
  }, [patternDatabase, setBeatMap]);

  const downloadPatternsDatabase = useCallback(() => {
    patternDatabase.serialize();
  }, [patternDatabase]);

  const clearPatternsDatabase = useCallback(() => {
    patternDatabase.clear();
    setLastAnalysisOutput(0);
  }, [patternDatabase, setLastAnalysisOutput]);

  const [downloadingBeatMap, setDownloadingBeatMap] = useState(false);
  const downloadBeatMapZip = useCallback(() => {
    if (beatMap == null) {
      return;
    }
    setDownloadingBeatMap(true);
    updateAndDownloadZip(beatMap, () => {
      setDownloadingBeatMap(false);
    });
  }, [beatMap]);

  if (!dbLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <Header />
      <FileInput onFilesChange={onFilesChange} />
      {
        lastAnalysisOutput != null && <div style={styles.text}>Imported {lastAnalysisOutput} patterns.</div>
      }
      <button style={styles.button} onClick={downloadPatternsDatabase}>Download patterns database. {patternDatabase.size()} patterns</button>
      <button style={styles.button} onClick={clearPatternsDatabase}>Clear patterns database.</button>
      {loadingFile && <div>Loading...</div>}
      <GeneralInfo modalLayerState={modalLayerState} beatMap={beatMap} onAnalyzeClick={onAnalyzeClick} onReMapClick={onReMapClick} />
      {beatMap != null && <button disabled={downloadingBeatMap} style={styles.button} onClick={downloadBeatMapZip}>{downloadingBeatMap ? 'Downloading...' : 'Download map .zip'}</button>}
    </div>
  );
}

export default App;
