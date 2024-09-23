import React, { useEffect } from "react";
import { useState } from "react";
import { storeFileInIndexedDB } from "../../Logic/database.ts";
import { Dropzone } from "./DropZone.tsx";


export function UploadSoundFile({onUpload}: {onUpload?: (file: File) => void}) {
    return <>
        <div>
            <Dropzone
                acceptedFileTypes="audio/*"
                onFileChanged={async (file) => {
                    try {
                        await storeFileInIndexedDB(file);
                        if (onUpload) {
                            onUpload(file);
                        }
                    } catch (error) {
                        console.error('Error converting file to base64:', error);
                    }
                }}
            />
        </div>
    </>
}
