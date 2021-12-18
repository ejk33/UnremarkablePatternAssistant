// @flow

import FileInput from "./FileInput.react";

import GeneralInfo from "./GeneralInfo.react";
import { readFromZipArchive } from "./MapArchive";

import React from "react";
import { useCallback, useState } from "react";

const styles = {
  container: {
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

  const onFilesChange = useCallback((file) => {
    processFile(file, setBeatMap);
  }, []);

  const onAnalyzeClick = useCallback((mapDifficulty) => {
    console.info('<><><> analyze', mapDifficulty)
  }, []);

  return (
    <div style={styles.container}>
      <Header />
      <FileInput onFilesChange={onFilesChange} />
      <GeneralInfo beatMap={beatMap} onAnalyzeClick={onAnalyzeClick} />
    </div>
  );
}

export default App;
