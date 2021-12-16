// @flow

import FileInput from "./FileInput.react";

import { readMapDifficultyFromFile } from "./MapDifficulty";

import React from "react";
import { useCallback } from "react";

const styles = {
  container: {
    padding: '16px'
  }
}

function Header(): React$MixedElement {
  return <h1>UNREMARKABLE PATTERN ASSISTANT</h1>;
}

async function processFile(file: File) {
  const difficultyMap = await readMapDifficultyFromFile(file);
  console.info('<><><> difficultyMap', difficultyMap);
}

function App(): React$MixedElement {
  const onFilesChange = useCallback((file) => {
    processFile(file);
  }, []);

  return (
    <div style={styles.container}>
      <Header />
      <FileInput onFilesChange={onFilesChange} />
    </div>
  );
}

export default App;
