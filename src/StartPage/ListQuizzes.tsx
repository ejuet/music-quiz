import { Link } from "react-router-dom";
import { useAppDataContext } from "../Logic/AppDataContext.tsx";
import { DeleteQuiz, AddQuiz } from "./AddQuiz.tsx";
import React from "react";

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
                                <DeleteQuiz id={q.id} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        }
        <AddQuiz />
    </div>
}