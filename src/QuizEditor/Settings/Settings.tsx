import React from "react";
import { useAppDataContext, useCurrentQuiz } from "../../Logic/AppDataContext.tsx";
import { Form } from "react-bootstrap";
import { DeleteQuizButton } from "../../StartPage/ListQuizzes.tsx";

export function Settings() {
    const currentQuiz = useCurrentQuiz();
    if(!currentQuiz) {
        return <></>
    }
    return <div>
        <Form.Label>Quiz Name</Form.Label>
        <EditQuizName />
        <DeleteQuizButton quiz={currentQuiz} />
    </div>
}

function EditQuizName() {
    const currentQuiz = useCurrentQuiz();
    const {setAppData, appData} = useAppDataContext();
    if(!currentQuiz) {
        return <></>
    }
    return <Form.Control type="text" defaultValue={currentQuiz.name} onChange={(e) => {
        currentQuiz.name = e.target.value
        setAppData(appData);
    }} />;
}