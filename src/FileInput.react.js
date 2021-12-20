// @flow

import React from "react";
import { useCallback, useEffect } from "react";

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
  return (
    <div>
      <div>Choose a Beat Saber map .zip file</div>
      <input type="file" accept="application/zip" onChange={(e) => {
        if (e.target.files.length > 0) {
          onFilesChange(e.target.files[0]);
        }
      }} />
    </div>
  );
}