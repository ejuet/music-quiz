import { Link } from "react-router-dom";
import { useAppDataContext } from "../Logic/AppDataContext.tsx";
import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import DeleteButton from "../Common/DeleteButton.tsx";
import { MusicQuiz } from "../Logic/structure.ts";
import { Card } from "react-bootstrap";
import { formatMyDate } from "../Common/formatDate.ts";

export function ListQuizzes() {
    const d = useAppDataContext();
    return <div>
        <h1>Your Quizzes</h1>
        <div className="row">
            {d.appData.musicQuizzes.map(q => (
                <div className="col-md-4" key={q.id}>
                        <Link to={`/quiz/${q.id}`} className="text-decoration-none">
                    <Card className="mb-4">
                            <Card.Body>
                                <Card.Title>
                                    {q.name}
                                </Card.Title>
                                <Card.Body>
                                    <Card.Text>
                                        <p>
                                            {q.items.length} questions <br />
                                            Created: {formatMyDate(q.created)} <br />
                                            Last Modified: {formatMyDate(q.lastModified)}
                                        </p>
                                    </Card.Text>
                                </Card.Body>
                            </Card.Body>
                    </Card>
                    </Link>
                </div>
            ))}
        </div>
        <AddQuiz />
    </div>
}

function DeleteQuizButton({quiz}:{quiz: MusicQuiz}) {
    const d = useAppDataContext();
    return <DeleteButton onDelete={() => {
        d.appData.deleteMusicQuiz(quiz.id);
        d.setAppData(d.appData);
    } } customMessage={<>
        Are you sure you want to delete quiz <b>{quiz.name}</b>?
    </>} />;
}

function AddQuiz() {
    const appData = useAppDataContext();
    return <Button onClick={() => {
        appData.appData.createMusicQuiz();
        appData.setAppData(appData.appData);
    }}>Add Quiz</Button>
}
