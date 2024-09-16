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
