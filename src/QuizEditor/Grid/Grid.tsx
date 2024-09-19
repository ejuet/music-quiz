import React from 'react';
import { AppData, MusicQuiz } from '../../Logic/structure.ts';

export function Grid(){
    const appData = new AppData();

    return (
        <div>
            <h1>Grid</h1>
            <p style={{whiteSpace: 'pre-wrap'}}>{JSON.stringify(appData, null, 4)}</p>
        </div>
    )
}