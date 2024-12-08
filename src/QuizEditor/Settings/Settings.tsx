import React from "react";
import { useAppDataContext, useCurrentQuiz } from "../../Logic/AppDataContext.tsx";
import { Form } from "react-bootstrap";

export function Settings() {
    return <div>
        <EditQuizName />
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