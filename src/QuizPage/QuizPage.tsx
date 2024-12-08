import { Link } from "react-router-dom";
import { useCurrentQuiz } from "../Logic/AppDataContext.tsx";
import React from "react";
import { formatMyDate } from "../Common/formatDate.ts";
import { Button, ButtonGroup } from "react-bootstrap";
import { DeleteQuizButton } from "../StartPage/ListQuizzes.tsx";

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
        <ButtonGroup>
            <Button as={Link as any} to={`/quiz/${currentQuiz.id}/edit`}>Edit</Button>
            <DeleteQuizButton quiz={currentQuiz} />
        </ButtonGroup>
    </>;
}
