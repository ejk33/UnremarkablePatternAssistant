// @flow

import { analyzeMapPatterns } from "./Analyzer";
import FileInput from "./FileInput.react";

import GeneralInfo from "./GeneralInfo.react";
import { readFromZipArchive } from "./MapArchive";

import { PatternDatabase } from "./PatternDatabase";

import React from "react";
import { useCallback, useMemo, useState } from "react";

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
  const beatMap = await readFromZipArchive(file);
  setBeatMap(beatMap);
}

function App(): React$MixedElement {
  const [beatMap, setBeatMap] = useState(null);
  const patternDatabase = useMemo(() => {
    return new PatternDatabase();
  }, []);
  const [lastAnalysisOutput, setLastAnalysisOutput] = useState(null);

  const onFilesChange = useCallback((file) => {
    processFile(file, setBeatMap);
  }, []);

  const onAnalyzeClick = useCallback((mapDifficulty) => {
    const groups = analyzeMapPatterns(mapDifficulty);
    for (let group of groups) {
      patternDatabase.ingest(group);
    }
    setLastAnalysisOutput(groups.length);
  }, [patternDatabase, setLastAnalysisOutput]);

  const downloadPatternsDatabase = useCallback(() => {
    patternDatabase.serialize();
  }, []);

  return (
    <div style={styles.container}>
      <Header />
      <FileInput onFilesChange={onFilesChange} />
      {
        lastAnalysisOutput != null && <div style={styles.text}>Imported {lastAnalysisOutput} patterns.</div>
      }
      <button style={styles.button} onClick={downloadPatternsDatabase}>Download patterns database. {patternDatabase.size()} patterns</button>
      <GeneralInfo beatMap={beatMap} onAnalyzeClick={onAnalyzeClick} />
    </div>
  );
}

export default App;
