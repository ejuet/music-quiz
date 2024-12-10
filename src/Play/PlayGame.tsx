import { Button } from "react-bootstrap";
import React from "react";
import { useAppDataContext, useCurrentGame, useCurrentQuiz } from "../Logic/AppDataContext.tsx";
import { AnswerQuestion, FinishGame, GameAction, SelectQuestion, ShowQuestionPart, TeamAction } from "../Logic/gameStructure.ts";
import { RenderShowQuestionPart } from "./RenderQuestion.tsx";

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
        <p>{nextActions.length} remaining Actions</p>
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

    return <div>
        <h1>Select Question</h1>
        <p>Team <b>{team?.name}</b> has to select their next question!</p>
        <ShowCurrentScore />
        {
            currentQuiz?.items.map((q) => {
                if(action.availableQuestions.includes(q.questionId)){
                    return <Button onClick={() => {
                        action.questionId = q.questionId;
                        setAppData(appData);
                    }}>{q.questionId} {q.getPoints()} Punkte</Button>
                }
            })
        }
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
            (currentGame.getLeafActions()[1] as AnswerQuestion).finished = true;
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