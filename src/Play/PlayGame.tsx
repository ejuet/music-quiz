import { Button } from "react-bootstrap";
import React from "react";
import { useAppDataContext, useCurrentGame, useCurrentQuiz } from "../Logic/AppDataContext.tsx";
import { CompositeGameAction, GameAction, LeafGameAction, SelectQuestion, ShowQuestionPart, TeamAction } from "../Logic/gameStructure.ts";
import { RenderShowQuestionPart } from "./RenderQuestion.tsx";
import { QuizGrid } from "../QuizEditor/Grid.tsx";
import { useState } from "react";
import { FaBars } from "react-icons/fa";


function WithSidebar({ children, sidebar, header = <></> }: { children: React.ReactNode, sidebar: React.ReactNode, header?: React.ReactNode }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const sidebarWidth = 350;
    const menuButtonSpace = 50;
    const currentSidebarWidth = showSidebar ? sidebarWidth : menuButtonSpace;
    return <div style={{ display: "flex" }}>
        <div style={{ width: currentSidebarWidth+"px", transition: "width 0.3s", position: "relative" }}>
            <div style={{ width: (sidebarWidth-menuButtonSpace)+"px", position: "absolute", right: menuButtonSpace }}>
                {header}
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

function RenderActionTree({ action, indent = 0, modifyIndex }: { action: GameAction, indent?: number, modifyIndex: (number)=>void }) {
    const game = useCurrentGame();
    return <div>
        <div style={{ marginLeft: indent * 20 }}>
            {action.actionType}
            {
                action instanceof LeafGameAction &&
                <>
                    {" "}{game?.getLeafActions().indexOf(action)}
                    <Button onClick={() => modifyIndex(game?.getLeafActions().indexOf(action))}>Go</Button>
                </>
            }
            {
                action instanceof CompositeGameAction &&
                action.actions.map((subAction, index) => <RenderActionTree key={index} action={subAction} indent={indent + 1} modifyIndex={modifyIndex} />)
            }
        </div>
    </div>
}

function WithGameSidebar({ children, modifyIndex }: { children: React.ReactNode, modifyIndex: (number)=>void }) {
    const currentGame = useCurrentGame();
    const currentQuiz = useCurrentQuiz();
    if(!currentGame || !currentQuiz) {
        return <h1>Game or Quiz not found</h1>;
    }
    const game = currentGame.getCurrentGame();
    return <WithSidebar header={<h2>Game</h2>} sidebar={<div>
        {
            game &&
            <CurrentPoints />
        }
        <p><b>TODO</b> make this less confusing</p>
        {
            game &&
            <RenderActionTree action={game} modifyIndex={modifyIndex} />
        }
        <Button onClick={() => {
            modifyIndex(-1);
        }}>Go to current Question</Button>
    </div>}>
        {children}
    </WithSidebar>
}

function CurrentPoints(){
    const currentGame = useCurrentGame();
    if(!currentGame){
        return <></>;
    }
    return <div>
        <ul>
            {
                currentGame.teams.map(team => <li>Team <b>{team.name}</b>: {currentGame.getCurrentPoints(team.id)} points</li>)
            }
        </ul>
    </div>
}

export function PlayGame(){
    const currentGame = useCurrentGame();
    const currentQuiz = useCurrentQuiz();
    const { appData, setAppData } = useAppDataContext();

    const [modifiedIndex, setModifiedIndex] = useState(-1);

    if(!currentGame){
        return <h1>Game not found</h1>;
    }
    if(!currentQuiz){
        return <h1>Quiz not found</h1>;
    }

    const nextActions = currentGame.getNextActionsToDisplay(modifiedIndex);

    return <>
        <WithGameSidebar modifyIndex={(i)=>{setModifiedIndex(i)}}>
            <div style={{ display: "flex", height: "89vh" }}>
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1, justifyContent: "center",
                    textAlign: "center"
                }}>
                    {
                        currentGame.gameActions.length === 0  &&
                        <Button onClick={() => {
                            currentGame.startGame(currentQuiz);
                            setAppData(appData);
                        }}>Start Game</Button>
                    }
                    {
                        nextActions.map((action, index) => <DisplayAction key={index} action={action} />)
                    }
                    {
                        nextActions.length !== 0 &&
                        <Button onClick={() => {
                            nextActions.forEach(a => {
                                if(a.finished === false) {
                                    a.setFinished(true)
                                }
                            });
                            setAppData(appData);
                        }} className="mt-3">Next</Button>
                    }
                    {
                        nextActions.length === 0 && currentGame.gameActions.length !== 0 &&
                        <EndScreen />
                    }
                </div>
            </div>


        </WithGameSidebar>
    </>
}

function EndScreen() {
    const currentGame = useCurrentGame();
    if(!currentGame) {
        return <></>;
    }
    const teams = currentGame.teams.sort((a, b) => currentGame.getCurrentPoints(b.id) - currentGame.getCurrentPoints(a.id));
    return <>
        <h1>Game Finished</h1>
        <h2>Final Scores</h2>
        {
            teams.map((team, i) => {
                const playerNames = currentGame.getTeam(team.id)!.players.map(p => p.name).join(", ");
                return <p key={team.id}>
                    {i + 1}. Place: Team <b>{team.name}</b> {playerNames ? `(${playerNames})` : ``} with {currentGame.getCurrentPoints(team.id)} points
                </p>
            })
        }
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
    const team = currentGame?.teams.find(t => t.id === action.teamId);
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