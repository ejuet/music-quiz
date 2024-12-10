import { Button } from "react-bootstrap";
import React from "react";
import { useAppDataContext, useCurrentGame, useCurrentQuiz } from "../Logic/AppDataContext.tsx";
import { FinishGame, GameAction, SelectQuestion, ShowQuestionPart, TeamAction } from "../Logic/gameStructure.ts";
import { RenderShowQuestionPart } from "./RenderQuestion.tsx";
import { QuizGrid } from "../QuizEditor/Grid.tsx";
import { useState } from "react";
import { FaBars } from "react-icons/fa";


function WithSidebar({ children, sidebar,  }: { children: React.ReactNode, sidebar: React.ReactNode }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const sidebarWidth = 250;
    const menuButtonSpace = 50;
    const currentSidebarWidth = showSidebar ? sidebarWidth : menuButtonSpace;
    return <div style={{ display: "flex" }}>
        <div style={{ width: currentSidebarWidth+"px", transition: "width 0.3s", position: "relative" }}>
            <div style={{ width: (sidebarWidth-menuButtonSpace)+"px", position: "absolute", right: menuButtonSpace }}>
                <h2>Menu</h2>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: "5px" }}>

                <Button onClick={() => setShowSidebar(!showSidebar)}>
                    <FaBars />
                </Button>
            </div>
            <div style={{ width: sidebarWidth+"px", position: "absolute", right: 0, height: "100%" }}>
                <div style={{ opacity: showSidebar ? 1 : 0, transition: "opacity 0.3s" }}>
                    {sidebar}
                </div>
            </div>
        </div>
        <div style={{ flex: 1 }}>
            {children}
        </div>
    </div>
}

function WithGameSidebar({ children }: { children: React.ReactNode }) {
    const currentGame = useCurrentGame();
    const currentQuiz = useCurrentQuiz();
    return <WithSidebar sidebar={<div>
        <h2>Game</h2>
        <p>Current Game: {currentGame?.name}</p>
        <p>Current Quiz: {currentQuiz?.name}</p>
    </div>}>

        {children}
    </WithSidebar>
}

export function PlayGame(){
    const currentGame = useCurrentGame();
    const currentQuiz = useCurrentQuiz();
    const { appData, setAppData } = useAppDataContext();
    if(!currentGame){
        return <h1>Game not found</h1>;
    }
    if(!currentQuiz){
        return <h1>Quiz not found</h1>;
    }

    const nextActions = currentGame.getNextActionsToDisplay();

    return <>
        {
            currentGame.gameActions.length === 0  &&
            <Button onClick={() => {
                currentGame.startGame(currentQuiz);
                setAppData(appData);
            }}>Start Game</Button>
        }
        <WithGameSidebar>
        {
            nextActions.map((action, index) => <DisplayAction key={index} action={action} />)
        }
        <Button onClick={() => {
            nextActions.forEach(a => {
                if(a.finished === false){
                    a.setFinished(true)
                }
            });
            setAppData(appData);
        }}>Next</Button>

        </WithGameSidebar>
    </>
}

function DisplayAction({ action }: { action:GameAction }) {
    return <div>
        {
            action.actionType === "SelectQuestion" &&
            <SelectQuestionAction action={action as SelectQuestion} />
        }
        {
            action.actionType === "ShowQuestionPart" &&
            <RenderShowQuestionPart action={action as ShowQuestionPart} />
        }
        {
            action.actionType === "FinishGame" &&
            <FinishGameAction action={action as FinishGame} />
        }
    </div>
}

function useCurrentTeam(){
    const currentGame = useCurrentGame();
    const currentAction = currentGame?.getNextAction();
    if(!currentAction || !currentGame){
        return undefined;
    }
    if(!(currentAction as TeamAction).teamId){
        return undefined;
    }
    return currentGame?.teams.find(t => t.id === (currentAction as TeamAction).teamId);
}

function SelectQuestionAction({ action }: { action: SelectQuestion }) {
    const currentQuiz = useCurrentQuiz();
    const currentGame = useCurrentGame();
    const team = useCurrentTeam();
    const { appData, setAppData } = useAppDataContext();

    if(!team || !currentQuiz) {
        return <h1>Team or Quiz not found</h1>;
    }

    return <div>
        <h1>Select Question</h1>
        <p>Team <b>{team?.name}</b> has to select their next question!</p>
        <ShowCurrentScore />
        <QuizGrid
            quiz={currentQuiz}
            renderQuestions={(questions, category, points) => {
                return <>
                    {
                        questions.map((question) => {
                            return <Button onClick={() => {
                                action.questionId = question.questionId;
                                setAppData(appData);
                            }}
                            disabled={!action.availableQuestions.includes(question.questionId)}
                            >
                                Select ({category.name} {points}p)
                            </Button>
                        })
                    }
                </>
            }
            }
        />
    </div>
}  



function ShowCurrentScore(){
    const team = useCurrentTeam();
    const currentGame = useCurrentGame();
    if(!team || !currentGame){
        return <></>;
    }
    return <div>
        <p>Team <b>{team.name}</b> currently has {currentGame.getCurrentPoints(team.id)} points!</p>
    </div>
}

function FinishGameAction({ action }: { action: FinishGame }) {
    const currentGame = useCurrentGame();
    return <div>
        <h1>Game Finished</h1>
        {
            action.teamStats.map(s => <p>Team {currentGame?.getTeam(s.teamId)?.name} has {s.points} points!</p>)
        }
    </div>
}


export function GameHistory(){
    const currentGame = useCurrentGame();
    const currentQuiz = useCurrentQuiz();
    const { appData, setAppData } = useAppDataContext();
    if(!currentGame){
        return <h1>Game not found</h1>;
    }
    if(!currentQuiz){
        return <h1>Quiz not found</h1>;
    }

    return <div>
        <h1>Game History</h1>
        <Button onClick={() => {
            currentGame.startGame(currentQuiz);
            setAppData(appData);
        }}>Generate</Button>
        <p style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(currentGame.gameActions, null, 4)}
        </p>
        <h2>Leaf Actions</h2>
        <Button onClick={() => {
            (currentGame.getLeafActions()[0] as SelectQuestion).questionId = "784908";
            setAppData(appData);
        }}>Example Select First</Button>
        <p style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(currentGame.getLeafActions(), null, 4)}
        </p>
        <h2>Next Action</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(currentGame.getNextAction(), null, 4)}
        </p>
    </div>
}