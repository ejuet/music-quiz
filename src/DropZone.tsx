import React from "react";

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