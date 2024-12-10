import React from "react";
import { DisplayableText, PlayableSong, Question, QuestionPartP, RightOrWrong, ShowAnswerButton, SimpleQuestion, SimpleQuestionContent } from "../Logic/structure.ts";
import { RenderDisplayableText } from "../Common/DisplayableText.tsx";
import { Button, ButtonGroup } from "react-bootstrap";
import { PlayAudio } from "../Database/DatabaseComponents.tsx";
import { ShowQuestionPart } from "../Logic/gameStructure.ts";
import { useAppDataContext } from "../Logic/AppDataContext.tsx";

export function RenderShowQuestionPart({ action }: { action: ShowQuestionPart }) {
    const part = action.part;
    return <>
        {
            typeof part === 'string' &&
            <p>{part}</p>
        }
        {
            part.partType === 'DisplayableText' &&
            <RenderDisplayableText text={part as DisplayableText} />
        }
        {
            part.partType === 'PlayableSong' &&
            <PlayAudio filename={(part as PlayableSong).filename} />
        }
        {
            part.partType === 'RightOrWrong' &&
            <RenderRightOrWrong questionPart={part as RightOrWrong} modifyPoints={() => { }} />
        }
        {
            part.partType === 'ShowAnswerButton' &&
            <RenderShowAnswerButton questionPart={part as ShowAnswerButton} action={action} />
        }
    </>
}

function RenderRightOrWrong({ questionPart, modifyPoints }: { questionPart: RightOrWrong, modifyPoints: (points: number) => void }) {
    return <>
        <ButtonGroup>
            <Button variant="success" onClick={() => {
                modifyPoints(questionPart.pointsIfRight);
            }}>Right Answer (+{questionPart.pointsIfRight})</Button>
            <Button variant="danger" onClick={() => {
                modifyPoints(questionPart.pointsIfWrong);
            }}>Wrong Answer (-{questionPart.pointsIfWrong})</Button>
        </ButtonGroup>
    </>
}

function RenderShowAnswerButton({ questionPart, action }: { questionPart: ShowAnswerButton, action: ShowQuestionPart }) {
    const [showAnswer, setShowAnswer] = React.useState(false);
    const { appData, setAppData } = useAppDataContext();
    return <>
        {
            showAnswer ?
            <>
                <RenderDisplayableText text={questionPart.answer} />
                <RenderRightOrWrong questionPart={questionPart.RightOrWrong} modifyPoints={(p)=>{
                    action.indPoints = p;
                    setAppData(appData);
                }} />
            </>
            :
            <Button onClick={() => setShowAnswer(true)}>Show Answer</Button>
        }
    </>
}
