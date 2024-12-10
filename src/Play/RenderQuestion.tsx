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

function RenderRightOrWrong({ questionPart, action }: { questionPart: RightOrWrong, action: ShowQuestionPart }) {
    const { appData, setAppData } = useAppDataContext();
    return <>
        <ButtonGroup>
            <Button variant="success" onClick={() => {
                action.indPoints = questionPart.pointsIfRight;
                setAppData(appData);
            }}>Right Answer (+{questionPart.pointsIfRight})</Button>
            <Button variant="danger" onClick={() => {
                action.indPoints = questionPart.pointsIfWrong;
                setAppData(appData);
            }}>Wrong Answer (-{questionPart.pointsIfWrong})</Button>
        </ButtonGroup>
    </>
}

function RenderShowAnswerButton({ questionPart, action }: { questionPart: ShowAnswerButton, action: ShowQuestionPart }) {
    const [showAnswer, setShowAnswer] = React.useState(false);
    return <>
        {
            showAnswer ?
            <>
                <RenderDisplayableText text={questionPart.answer} />
                <RenderRightOrWrong questionPart={questionPart.RightOrWrong} action={action} />
            </>
            :
            <Button onClick={() => setShowAnswer(true)}>Show Answer</Button>
        }
    </>
}
