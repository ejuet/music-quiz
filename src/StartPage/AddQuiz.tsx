import { Button } from "react-bootstrap";
import { useAppDataContext } from "../Logic/AppDataContext.tsx";
import React from "react";

export function AddQuiz() {
    const appData = useAppDataContext();
    return <Button onClick={() => {
        appData.appData.createMusicQuiz();
        appData.setAppData(appData.appData);
    }}>Add Quiz</Button>
}