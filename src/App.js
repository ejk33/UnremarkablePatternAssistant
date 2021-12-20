// @flow

import type { BeatMap } from "./MapArchive";

import { analyzeMapPatterns } from "./Analyzer";
import FileInput from "./FileInput.react";

import GeneralInfo from "./GeneralInfo.react";
import { readFromZipArchive, updateAndDownloadZip } from "./MapArchive";

import { PatternDatabase } from "./PatternDatabase";

import { ReMap } from "./ReMapper";

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

async function processFile(file: File, setBeatMap) {
  console.info('<><><> process input file');
  const beatMap = await readFromZipArchive(file);
  setBeatMap(beatMap);
}

function App(): React$MixedElement {
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

  const onFilesChange = useCallback((file) => {
    processFile(file, setBeatMap);
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
    console.info('ReMap completed');
    setBeatMap(beatMap => {
      return beatMap == null ? null : {
        ...beatMap
      }
    })
  }, [patternDatabase, setBeatMap]);

  const downloadPatternsDatabase = useCallback(() => {
    patternDatabase.serialize();
  }, [patternDatabase]);

  const downloadBeatMapZip = useCallback(() => {
    if (beatMap == null) {
      return;
    }
    updateAndDownloadZip(beatMap);
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
      <GeneralInfo beatMap={beatMap} onAnalyzeClick={onAnalyzeClick} onReMapClick={onReMapClick} />
      { beatMap != null && <button style={styles.button} onClick={downloadBeatMapZip}>Download map .zip</button>}
    </div>
  );
}

export default App;
