import { Link } from "react-router-dom";
import { useAppDataContext } from "../Logic/AppDataContext.tsx";
import React from "react";
import { Button } from "react-bootstrap";
import DeleteButton from "../Common/DeleteButton.tsx";

export function ListQuizzes() {
    const d = useAppDataContext();
    return <div>
        <h1>Your Quizzes</h1>
        {
            <table className="table">
                <thead>
                    <tr>
                        <th>Quiz Name</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {d.appData.musicQuizzes.map(q => (
                        <tr key={q.id}>
                            <td>
                                <Link to={`/quiz/${q.id}`}>{q.name}</Link>
                            </td>
                            <td style={{ textAlign: "right" }}>
                                <DeleteButton onDelete={() => {
                                    d.appData.deleteMusicQuiz(q.id);
                                    d.setAppData(d.appData);
                                }} customMessage={
                                    <>
                                        Are you sure you want to delete quiz <b>{q.name}</b>?
                                    </>
                                } />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        }
        <AddQuiz />
    </div>
}

function AddQuiz() {
    const appData = useAppDataContext();
    return <Button onClick={() => {
        appData.appData.createMusicQuiz();
        appData.setAppData(appData.appData);
    }}>Add Quiz</Button>
}
