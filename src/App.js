// @flow

import FileInput from "./FileInput.react";

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

function App(): React$MixedElement {
  const onFilesChange = useCallback(file => {
    console.info('<><><> selected file is', file);
  }, []);

  return (
    <div style={styles.container}>
      <Header />
      <FileInput onFilesChange={onFilesChange} />
    </div>
  );
}

export default App;
