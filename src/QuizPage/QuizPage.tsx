import { Link } from "react-router-dom";
import { useAppDataContext, useCurrentQuiz } from "../Logic/AppDataContext.tsx";
import React from "react";
import { formatMyDate } from "../Common/formatDate.ts";
import { Button, ButtonGroup } from "react-bootstrap";
import { DeleteQuizButton } from "../StartPage/ListQuizzes.tsx";
import { Card, ListGroup } from "react-bootstrap";
import DeleteButton from "../Common/DeleteButton.tsx";


export function QuizPage() {
    const currentQuiz = useCurrentQuiz();

    if(!currentQuiz) {
        return <h1>Quiz not found</h1>;
    }
    return <>
        <h1>Quiz <b>{currentQuiz.name}</b></h1>
        <p>
            {currentQuiz.items.length} questions <br />
            Created: {formatMyDate(currentQuiz.created)} <br />
            Last Modified: {formatMyDate(currentQuiz.lastModified)}
        </p>
        <h2>Play</h2>
        <SaveGames quizId={currentQuiz.id} />
        <ButtonGroup>
            <Button as={Link as any} to={`/quiz/${currentQuiz.id}/edit`}>Edit</Button>
            <DeleteQuizButton quiz={currentQuiz} />
        </ButtonGroup>
    </>;
}

function SaveGames({ quizId }: { quizId: string }) {
    const d = useAppDataContext();
    const games = d.appData.saveGames.filter(g => g.quizId === quizId);
    return (
        <>
            <ListGroup>
                {games.map(game => (
                    <ListGroup.Item key={game.quizId}>
                        <Link to={`/quiz/${quizId}/game/${game.saveId}`} className="text-decoration-none">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{game.name}</Card.Title>
                                    <Card.Text>
                                        Created: {formatMyDate(game.created)} <br />
                                        Teams: {game.teams.length}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Link>
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <Button onClick={() => {
                d.appData.addSaveGame(quizId);
                d.setAppData(d.appData);
            }}>New Game</Button>
        </>
    );
}
