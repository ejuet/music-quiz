// ---------- Save to Cache ----------

import { createContext, useContext, useEffect, useState } from "react";
import { AppData, MusicQuiz, Question } from "./structure.ts";
import React from "react";
import { useParams } from "react-router-dom";

function loadAppData(): AppData {
    const ret = localStorage.getItem("musicQuizAppData") ? JSON.parse(localStorage.getItem("musicQuizAppData")!) as AppData : new AppData();
    ret.musicQuizzes = [{
        id: "1",
        name: "Neues Quiz",
        items: [
            {
                question: "What is the capital of France?",
                song: {
                    filename: 'Snowy Peaks pt II - Chris Haugen.mp3'
                },
                pointsIfRight: 10,
                answer: {
                    text: 'Paris'
                }
            },
            {
                question: "What is the capital of Germany?",
                song: {
                    filename: 'Snowy Peaks pt II - Chris Haugen.mp3'
                },
                pointsIfRight: 20,
                answer: {
                    text: 'Bonn'
                }
            }
        ],
    }]
    return ret;
}

function saveAppData(data: AppData){
    localStorage.setItem("musicQuizAppData", JSON.stringify(data));
}

interface AppDataContext {
    appData: AppData;
    setAppData: (data: AppData) => void;
}

const appDataContext = createContext<AppDataContext>({
    appData: new AppData(),
    setAppData: () => {}
});
export function useAppDataContext(){
    return useContext(appDataContext);
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {

    //app data:
    const [appData, setAppData] = useState<AppData>(loadAppData());
    const updateAppData = (data: AppData) => {
        saveAppData(data);
        setAppData(loadAppData());
    };

    return (
        <appDataContext.Provider value={{ appData, setAppData: updateAppData }}>
            {children}
        </appDataContext.Provider>
    );
}

export function useCurrentQuiz(){
    const { appData } = useAppDataContext();
    const [currentQuiz, setCurrentQuiz] = useState<MusicQuiz | undefined>(undefined);
    const quizFromUrl = useParams<{ quizID: string }>().quizID;
    useEffect(() => {
        console.log("Setting current quiz to", quizFromUrl);
        if (quizFromUrl) {
            setCurrentQuiz(appData.musicQuizzes.find(q => q.id === quizFromUrl));
        }
    }, [quizFromUrl, appData.musicQuizzes]);
    return currentQuiz;
}