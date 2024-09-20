import React from 'react';
import { AppData, MusicQuiz } from '../../Logic/structure.ts';
import { useCurrentQuiz } from '../../Logic/AppDataContext.tsx';

export function Grid(){
    const currentQuiz = useCurrentQuiz();

    return (
        <div>
            <h1>Grid</h1>
            <p style={{whiteSpace: 'pre-wrap'}}>{JSON.stringify(currentQuiz, null, 4)}</p>
        </div>
    )
}