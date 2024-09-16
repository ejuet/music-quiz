import React, { useEffect, useState } from "react";
import { deleteFileFromDB, getFilesFromIndexedDB } from "./database.ts";


export const ResetDBButton: React.FC = () => {
    const handleReset = async () => {
        try {
            await new Promise<void>((resolve, reject) => {
                indexedDB.deleteDatabase('UserFilesDB');
            });
            console.log('Database reset successfully');
        } catch (error) {
            console.error('Error resetting database:', error);
        }
    };

    return (
        <button onClick={handleReset}>
            Delete Database To Recreate
        </button>
    );
};



export function AudioFileList() {
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

    return (
        <div>
            <h2>Uploaded Files</h2>
            <ul>
                {files.map((file, index) => (
                    <li key={index}>
                        {file.name}
                        <audio controls src={URL.createObjectURL(file)} />
                        <button onClick={() => deleteFileFromDB(file, 'audioFiles')}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
