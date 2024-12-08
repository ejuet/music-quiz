import React, { useEffect, useState } from "react";
import { deleteFileFromDB, getFilesFromIndexedDB } from "../Logic/database.ts";
import { Button, Modal } from "react-bootstrap";
import DeleteButton from "../Common/DeleteButton.tsx";


export const ResetDBButton: React.FC = () => {
    const handleReset = async () => {
        try {
            await new Promise<void>((resolve, reject) => {
                indexedDB.deleteDatabase('UserFilesDB');
            });
            console.log('Database reset successfully');
        } catch(error) {
            console.error('Error resetting database:', error);
        }
    };

    return (
        <button onClick={handleReset}>
            Delete Database To Recreate
        </button>
    );
};

export function useAudioFiles() {
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        const fetchFiles = async () => {
            const filesFromDB = await getFilesFromIndexedDB("audioFiles");
            setFiles(filesFromDB);
        };
        fetchFiles();

        document.addEventListener('databaseChange', fetchFiles);

        return () => {
            document.removeEventListener('databaseChange', fetchFiles);
        };
    }, []);

    return files;
}

export function AudioFileList() {
    const files = useAudioFiles();


    return (
        <div>
            <div className="d-flex flex-wrap">
                {files.map((file, index) => <AudioFile key={file.name} file={file} />
                )}
            </div>
        </div>
    );
}

function AudioFile({ file } : { file: File }) {

    return <div className="card m-2" style={{ width: '25rem' }}>
        <div className="card-body">
            <h5 className="card-title">{file.name}</h5>
            <div>
                <PlayAudio filename={file.name} />
            </div>
            <DeleteButton onDelete={() => deleteFileFromDB(file, "audioFiles")} customMessage={
                <>
                    <p>Do you really want to delete file <br />
                        <b>{file.name}</b>?<br />
                        You will not be able to play or show it in any quiz and you cannot recover it.
                    </p>
                </>
            } />
        </div>
    </div>
}

export function PlayAudio({ filename } : { filename: string }) {
    const [file, setFile] = useState<File>();
    useEffect(() => {
        const fetchFile = async () => {
            const files = await getFilesFromIndexedDB("audioFiles");
            const file = files.find((file) => file.name === filename);
            setFile(file);
        };
        fetchFile();
    }, [filename]);

    if(!file) return <small>File not found</small>

    return <audio controls src={URL.createObjectURL(file)} />
}
