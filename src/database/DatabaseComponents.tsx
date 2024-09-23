import React, { useEffect, useState } from "react";
import { deleteFileFromDB, getFilesFromIndexedDB } from "../Logic/database.ts";
import { Button, Modal } from "react-bootstrap";


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
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    return <div className="card m-2" style={{ width: '25rem' }}>
        <div className="card-body">
            <h5 className="card-title">{file.name}</h5>
            <div>
                <PlayAudio filename={file.name} />
            </div>
            <button
                className="btn btn-danger mt-2"
                onClick={() => setShowConfirmDialog(true)}
            >
                Delete
            </button>
            <ConfirmDelete file={file} show={showConfirmDialog} setShow={setShowConfirmDialog} />
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

function ConfirmDelete({ file, show, setShow }) {
    return (
        <Modal show={show ? show : false} onHide={() => setShow(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Do you really want to delete file <br />
                    <b>{file.name}</b>?<br />
                    You will not be able to play or show it in any quiz and you cannot recover it.
                </p>

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={() => deleteFileFromDB(file, "audioFiles")}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );

}
