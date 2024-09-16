const openDatabase = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('UserFilesDB', 1);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore('audioFiles', { keyPath: 'file.name', autoIncrement: true });
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};

function triggerChangeNotification(info : {type: string, detail: any}) {
    const event = new CustomEvent('databaseChange', { detail: info });
    document.dispatchEvent(event);  // Dispatch the custom event
}

export const storeFileInIndexedDB = async (file: File) => {
    const db = await openDatabase();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('audioFiles', 'readwrite');
        const store = transaction.objectStore('audioFiles');

        const addRequest = store.add({file: file});

        addRequest.onsuccess = () => {
            triggerChangeNotification({type: 'add', detail: file});
            resolve();
        };

        addRequest.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };
    });
};

export function deleteFileFromDB(file: File, storeName: string): Promise<void> {
    return openDatabase().then(db => {
        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const req = store.get(file.name);

            req.onsuccess = () => {
                const result = req.result;
                if (result) {
                    const deleteRequest = store.delete(file.name);
                    deleteRequest.onsuccess = () => {
                        triggerChangeNotification({ type: 'delete', detail: file });
                        resolve();
                    };
                    deleteRequest.onerror = (event) => {
                        reject((event.target as IDBRequest).error);
                    };
                } else {
                    reject('File not found');
                }
            };

            req.onerror = (event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    });
}



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
