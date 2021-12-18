// @flow

import React from "react";
import { useEffect } from "react";

import {useDropzone} from 'react-dropzone';

const styles = {
    dropzone: {
        padding: '16px',
        borderStyle: 'solid',
        borderColor: '#c5c5c5'
    },
    message: {
        padding: '16px',
    }
}

type Props = {
    onFilesChange: (file: File) => void;    
};

export default function FileInput({onFilesChange}: Props): React$MixedElement {
  const {acceptedFiles, getRootProps, getInputProps} = useDropzone({
      multiple: false,
      accept: 'application/zip'
  });
  
  useEffect(() => {
      if (acceptedFiles.length == 0) {
          return;
      }
      onFilesChange(acceptedFiles[0]);
  }, [acceptedFiles]);

  return (
      <div style={styles.dropzone} {...getRootProps({})}>
        <input {...getInputProps()} />
        <p>Drop or choose a Beat Saber map .zip file</p>
      </div>
  );
}