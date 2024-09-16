import React, { useEffect } from "react";
import { useState } from "react";
import { AudioFileList } from "./database/DatabaseComponents.tsx";
import { storeFileInIndexedDB } from "./database/database.ts";
import { Dropzone } from "./DropZone.tsx";


export function UploadSoundFile() {
    return <>
        <div>
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
        </div>
    </>
}
