import React, { useEffect } from "react";
import { useState } from "react";
import { AudioFileList, storeFileInIndexedDB } from "./database.tsx";


interface DropzoneProps {
    onFileChanged: (file: File) => void;
    acceptedFileTypes?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileChanged, acceptedFileTypes }) => {
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if(file && (!acceptedFileTypes || file.type.match(acceptedFileTypes))) {
            onFileChanged(file);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('fileInput')?.click()}
            style={{
                border: "2px dashed #cccccc",
                borderRadius: "4px",
                padding: "20px",
                textAlign: "center",
                color: "#cccccc",
                cursor: "pointer",
            }}
        >
            Drag and drop a file here, or click to select a file
            <input
                id="fileInput"
                type="file"
                accept={acceptedFileTypes}
                style={{ display: "none" }}
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if(file && (!acceptedFileTypes || file.type.match(acceptedFileTypes))) {
                        onFileChanged(file);
                    }
                }}
            />
        </div>
    );
};

export function UploadSoundFile() {
    const [audioSrc, setAudioSrc] = useState<string | null>(null);

    return <>
        <div>
            <h1>Upload Sound File</h1>
            <Dropzone
                acceptedFileTypes="audio/*"
                onFileChanged={async (file) => {
                    try {
                        await storeFileInIndexedDB(file);
                        console.log('File stored in IndexedDB');
                    } catch (error) {
                        console.error('Error converting file to base64:', error);
                    }
                }}
            />
            {audioSrc && <audio controls src={audioSrc} />}
            <p>{audioSrc}</p>
            <AudioFileList />
        </div>
    </>
}
