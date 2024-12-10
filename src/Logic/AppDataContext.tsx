// ---------- Save to Cache ----------

import { createContext, useContext, useEffect, useState } from "react";
import { AppData, MultiQuestion, MusicQuiz, PageBreak, PlayableSong, Question, QuestionPartP, RightOrWrong, SimpleQuestion, SimpleQuestionContent, SimpleText } from "./structure.ts";
import React from "react";
import { useParams } from "react-router-dom";
import { category } from "fp-ts";
import { GameAction, SaveGame, SelectAndAnswerQuestion, SelectQuestion, PlayGame as PlayGameDS, ShowQuestionParts, ShowQuestionPart } from "./gameStructure.ts";
import { PlayGame as PlayG } from "../Play/PlayGame.tsx";


function setPrototypeOfQuestionPartP(part: QuestionPartP){
    if(part.partType === "SimpleText"){
        Object.setPrototypeOf(part, SimpleText.prototype);
    }
    else if(part.partType === "RightOrWrong"){
        Object.setPrototypeOf(part, RightOrWrong.prototype);
    }
    else if(part.partType === "PlayableSong"){
        Object.setPrototypeOf(part, PlayableSong.prototype);
    }
    else if(part.partType === "PageBreak"){
        Object.setPrototypeOf(part, PageBreak.prototype);
    }
    else if(typeof part === "string"){
        Object.setPrototypeOf(part, String.prototype);
    }
}

function setPrototypeOfQuestion(question: Question){
    if(question.questionType === "SimpleQuestion"){
        Object.setPrototypeOf(question, SimpleQuestion.prototype);
        const parsedQuestion = question as SimpleQuestion;
        Object.setPrototypeOf(parsedQuestion.content, SimpleQuestionContent.prototype);
    }
    else if (question.questionType === "MultiQuestion"){
        Object.setPrototypeOf(question, MultiQuestion.prototype);
        const parsedQuestion = question as MultiQuestion;
        parsedQuestion.content.forEach((content) => {
            Object.setPrototypeOf(content, SimpleQuestionContent.prototype);
        });
    }
    question.getParts().forEach((part) => {
        setPrototypeOfQuestionPartP(part as QuestionPartP)
    })
}

function loadAppData(): AppData {
    const ret = localStorage.getItem("musicQuizAppData") ? JSON.parse(localStorage.getItem("musicQuizAppData")!) as AppData : new AppData();

    Object.setPrototypeOf(ret, AppData.prototype);

    ret.musicQuizzes.forEach((quiz) => {
        Object.setPrototypeOf(quiz, MusicQuiz.prototype);
        quiz.created = new Date(quiz.created);
        quiz.lastModified = new Date(quiz.lastModified);

        quiz.items.forEach((item) => {
            setPrototypeOfQuestion(item);
        });
    });

    ret.saveGames.forEach((game) => {
        Object.setPrototypeOf(game, SaveGame.prototype);
        game.created = new Date(game.created);
        game.gameActions.forEach((action) => {
            if(action.actionType === "PlayGame"){
                Object.setPrototypeOf(action, PlayGameDS.prototype);
                const parsedAction = action as PlayGameDS;
                parsedAction.actions.forEach((subAction) => {
                    if (subAction.actionType === "SelectAndAnswerQuestion"){
                        Object.setPrototypeOf(subAction, SelectAndAnswerQuestion.prototype);
                        Object.setPrototypeOf((subAction as SelectAndAnswerQuestion).selectQuestion, SelectQuestion.prototype);

                        // set prototype of ShowQuestionParts
                        const showQuestionParts = (subAction as SelectAndAnswerQuestion).showQuestionParts;
                        Object.setPrototypeOf(showQuestionParts, ShowQuestionParts.prototype);
                        showQuestionParts.questionParts.forEach((part) => {
                            Object.setPrototypeOf(part, ShowQuestionPart.prototype);
                            setPrototypeOfQuestionPartP(part.part as QuestionPartP);
                        });
                        showQuestionParts.allQuestions.forEach((question) => {
                            setPrototypeOfQuestion(question);
                        })
                    }
                });
            }
        })
    });

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
        if (quizFromUrl) {
            setCurrentQuiz(appData.musicQuizzes.find(q => q.id === quizFromUrl));
        }
    }, [quizFromUrl, appData.musicQuizzes]);
    return currentQuiz;
}

export function useCurrentGame(){
    const { appData } = useAppDataContext();
    const [currentGame, setCurrentGame] = useState<SaveGame | undefined>(undefined);
    const gameFromUrl = useParams<{ gameID: string }>().gameID;
    useEffect(() => {
        if (gameFromUrl) {
            setCurrentGame(appData.saveGames.find(q => q.saveId === gameFromUrl));
        }
    }, [gameFromUrl, appData.saveGames]);
    return currentGame;
}