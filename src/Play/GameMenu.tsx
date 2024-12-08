import React from "react";
import { useAppDataContext, useCurrentGame } from "../Logic/AppDataContext.tsx";
import { Button, Form, ListGroup } from "react-bootstrap";
import { formatMyDate } from "../Common/formatDate.ts";
import { Player } from "../Logic/gameStructure.ts";
import DeleteButton from "../Common/DeleteButton.tsx";

export function GameMenu() {
    const currentGame = useCurrentGame();
    const { appData, setAppData } = useAppDataContext();
    if(!currentGame) {
        return <h1>Game not found</h1>;
    }
    return <>
        <h1>Save File <b>{currentGame.name}</b></h1>
        <Form.Label>Name</Form.Label>
        <Form.Control type="text" defaultValue={currentGame.name} onChange={(e) => {
            currentGame.name = e.target.value;
            setAppData(appData);
        }} />
        <p>
            Created: {formatMyDate(currentGame.created)} <br />
            Teams: {currentGame.teams.length}
        </p>
        <h2>Teams</h2>
        <Teams />
    </>
}

function Teams() {
    const currentGame = useCurrentGame();
    const { appData, setAppData } = useAppDataContext();
    if(!currentGame) {
        return <></>;
    }
    return <>
        <ListGroup>
            {currentGame.teams.map(team => (
                <ListGroup.Item key={team.id} className="mb-4">
                    <Team teamId={team.id} />
                </ListGroup.Item>
            ))}
        </ListGroup>
        <Button onClick={() => {
            currentGame.teams.push({ name: "", id: Math.random().toString(), players: [], gameActions: [] });
            setAppData(appData);
        }}>New Team</Button>
    </>
}

function Team({ teamId }: { teamId: string }) {
    const currentGame = useCurrentGame();
    const { appData, setAppData } = useAppDataContext();
    if(!currentGame) {
        return <></>;
    }
    const team = currentGame.teams.find(t => t.id === teamId);
    if(!team) {
        return <></>;
    }
    return <>
        <Form.Label>Team Name</Form.Label>
        <Form.Control type="text" defaultValue={team.name} onChange={(e) => {
            team.name = e.target.value;
            setAppData(appData);
        }} />
        <Form.Label>Players</Form.Label>
        {
            team.players.map(player => <div className="d-flex" style={{maxWidth: "400px"}}>
                <Form.Control type="text" defaultValue={player.name} onChange={(e) => {
                    player.name = e.target.value;
                    setAppData(appData);
                }} />
                <DeleteButton onDelete={() => {
                    team.players = team.players.filter(p => p.id !== player.id);
                    setAppData(appData);
                }} customMessage={"Do you really want to delete player "+player.name+"?"} />
            </div>)
        }
        <Button onClick={() => {
            const newPlayer = new Player()
            team.players.push(newPlayer);
            setAppData(appData);
        }}>New Player</Button>
    </>
}