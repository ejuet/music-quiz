import React, { useEffect, useState } from "react";

const openDatabase = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('UserFilesDB', 1);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore('audioFiles', { keyPath: 'id', autoIncrement: true });
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};

export const storeFileInIndexedDB = async (file: File) => {
    const db = await openDatabase();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('audioFiles', 'readwrite');
        const store = transaction.objectStore('audioFiles');
        const request = store.add({ file });

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };
    });
};

const resetDatabase = async () => {
    return new Promise<void>((resolve, reject) => {
        indexedDB.deleteDatabase('UserFilesDB');
    });
};

export const ResetDBButton: React.FC = () => {
    const handleReset = async () => {
        try {
            await resetDatabase();
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


export function getFilesFromIndexedDB(storeName:string): Promise<File[]> {
    return openDatabase().then(db => {
        return new Promise<File[]>((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = (event) => {
                const files = (event.target as IDBRequest).result.map((item: any) => item.file);
                resolve(files);
            };

            request.onerror = (event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    });
}

export function AudioFileList() {
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        const fetchFiles = async () => {
            const filesFromDB = await getFilesFromIndexedDB("audioFiles");
            setFiles(filesFromDB);
        };
        fetchFiles();
    }, []);

    return (
        <div>
            <h2>Uploaded Files</h2>
            <ul>
                {files.map((file, index) => (
                    <li key={index}>
                        {file.name}
                        <audio controls src={URL.createObjectURL(file)} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
