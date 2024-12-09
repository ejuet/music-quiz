// ---------- Save to Cache ----------

import { createContext, useContext, useEffect, useState } from "react";
import { AppData, MultiQuestion, MusicQuiz, PlayableSong, Question, QuestionPartP, RightOrWrong, SimpleQuestion, SimpleQuestionContent, SimpleText } from "./structure.ts";
import React from "react";
import { useParams } from "react-router-dom";
import { category } from "fp-ts";
import { AnswerQuestion, GameAction, SaveGame, SelectAndAnswerQuestion, SelectQuestion, PlayGame as PlayGameDS, FinishGame, ShowQuestionParts } from "./gameStructure.ts";
import { PlayGame as PlayG } from "../Play/PlayGame.tsx";


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
        const p = part as QuestionPartP
        if(p.partType === "SimpleText"){
            Object.setPrototypeOf(p, SimpleText.prototype);
        }
        else if(p.partType === "RightOrWrong"){
            Object.setPrototypeOf(p, RightOrWrong.prototype);
        }
        else if(p.partType === "PlayableSong"){
            Object.setPrototypeOf(p, PlayableSong.prototype);
        }
        else if(typeof part === "string"){
            Object.setPrototypeOf(p, String.prototype);
        }
    })
}

function loadAppData(): AppData {
    const ret = localStorage.getItem("musicQuizAppData") ? JSON.parse(localStorage.getItem("musicQuizAppData")!) as AppData : new AppData();
    /*
    ret.musicQuizzes = [{
        id: "1",
        name: "Neues Quiz",
        categories: [
            {
                id: "1",
                name: "Geography"
            },
            {
                id: "2",
                name: "History"
            },
            {
                id: "3",
                name: "Science"
            }
        ],
        items: [
            {
                category: "1",
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
                category: "1",
                question: "What is the capital of Germany?",
                song: {
                    filename: 'Snowy Peaks pt II - Chris Haugen.mp3'
                },
                pointsIfRight: 20,
                answer: {
                    text: 'Berlin'
                }
            },
            {
                category: "2",
                question: "Who was the first President of the United States?",
                song: {
                    filename: 'Snowy Peaks pt II - Chris Haugen.mp3'
                },
                pointsIfRight: 10,
                answer: {
                    text: 'George Washington'
                }
            },
            {
                category: "2",
                question: "In which year did World War II end?",
                song: {
                    filename: 'Snowy Peaks pt II - Chris Haugen.mp3'
                },
                pointsIfRight: 25,
                answer: {
                    text: '1945'
                }
            },
            {
                category: "3",
                question: "What is the chemical symbol for water?",
                song: {
                    filename: 'Snowy Peaks pt II - Chris Haugen.mp3'
                },
                pointsIfRight: 10,
                answer: {
                    text: 'H2O'
                }
            },
            {
                category: "3",
                question: "What planet is known as the Red Planet?",
                song: {
                    filename: 'Snowy Peaks pt II - Chris Haugen.mp3'
                },
                pointsIfRight: 20,
                answer: {
                    text: 'Mars'
                }
            }
        ],
    }]
    */

    Object.setPrototypeOf(ret, AppData.prototype);

    ret.musicQuizzes.forEach((quiz) => {
        Object.setPrototypeOf(quiz, MusicQuiz.prototype);
        quiz.created = new Date(quiz.created);
        quiz.lastModified = new Date(quiz.lastModified);

        quiz.items.forEach((item) => {
            if(item.questionType === "SimpleQuestion"){
                Object.setPrototypeOf(item, SimpleQuestion.prototype);
                const parsedItem = item as SimpleQuestion;
                Object.setPrototypeOf(parsedItem.content, SimpleQuestionContent.prototype);
            }
            else if (item.questionType === "MultiQuestion"){
                Object.setPrototypeOf(item, MultiQuestion.prototype);
                const parsedItem = item as MultiQuestion;
                parsedItem.content.forEach((content) => {
                    Object.setPrototypeOf(content, SimpleQuestionContent.prototype);
                });
            }
            item.getParts().forEach((part) => {
                const p = part as QuestionPartP
                if(p.partType === "SimpleText"){
                    Object.setPrototypeOf(p, SimpleText.prototype);
                }
                else if(p.partType === "RightOrWrong"){
                    Object.setPrototypeOf(p, RightOrWrong.prototype);
                }
                else if(p.partType === "PlayableSong"){
                    Object.setPrototypeOf(p, PlayableSong.prototype);
                }
                else if(typeof part === "string"){
                    Object.setPrototypeOf(p, String.prototype);
                }
            })
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
                        Object.setPrototypeOf((subAction as SelectAndAnswerQuestion).answerQuestion, AnswerQuestion.prototype);

                        // set prototype of ShowQuestionParts
                        const showQuestionParts = (subAction as SelectAndAnswerQuestion).showQuestionParts;
                        Object.setPrototypeOf(showQuestionParts, ShowQuestionParts.prototype);
                        showQuestionParts.questionParts.forEach((part) => {
                            Object.setPrototypeOf(part, ShowQuestionParts.prototype);
                        });
                        showQuestionParts.allQuestions.forEach((question) => {
                            setPrototypeOfQuestion(question);
                        })
                    }
                    else if (subAction.actionType === "FinishGame"){
                        Object.setPrototypeOf(subAction, FinishGame.prototype);
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