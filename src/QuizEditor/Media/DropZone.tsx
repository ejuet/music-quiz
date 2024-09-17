import React from "react";

interface DropzoneProps {
    onFileChanged: (file: File) => void;
    acceptedFileTypes?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileChanged, acceptedFileTypes }) => {
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        files.forEach(file => {
            if(file && (!acceptedFileTypes || file.type.match(acceptedFileTypes))) {
                onFileChanged(file);
            }
        });
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
            Drag and drop files here, or click to select files
            <input
                id="fileInput"
                type="file"
                accept={acceptedFileTypes}
                multiple
                style={{ display: "none" }}
                onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    files.forEach(file => {
                        if(file && (!acceptedFileTypes || file.type.match(acceptedFileTypes))) {
                            onFileChanged(file);
                        }
                    });
                }}
            />
        </div>
    );
};