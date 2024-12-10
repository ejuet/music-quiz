import React from "react";
import { DisplayableText, PlayableSong, Question, QuestionPartP, RightOrWrong, ShowAnswerButton, SimpleQuestion, SimpleQuestionContent, SimpleText } from "../Logic/structure.ts";
import { RenderDisplayableText } from "../Common/DisplayableText.tsx";
import { Button, ButtonGroup, Form, ToggleButton } from "react-bootstrap";
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
            part.partType === 'SimpleText' &&
            <RenderDisplayableText text={part as SimpleText} />
        }
        {
            part.partType === 'PlayableSong' &&
            <PlayAudio filename={(part as PlayableSong).filename} />
        }
        {
            part.partType === 'RightOrWrong' &&
            <RenderRightOrWrong questionPart={part as RightOrWrong} action={action} />
        }
        {
            part.partType === 'ShowAnswerButton' &&
            <RenderShowAnswerButton questionPart={part as ShowAnswerButton} action={action} />
        }
        {
            part.partType === 'EnterCustomPoints' &&
            <RenderEnterCustomPoints action={action} />
        }
    </>
}

function RenderEnterCustomPoints({ action }: { action: ShowQuestionPart }) {
    const { appData, setAppData } = useAppDataContext();
    return <>
        <Form.Control
            value={action.indPoints}
            onChange={(e) => {
                const givenPoints = parseInt(e.target.value);
                if(!isNaN(givenPoints)){
                    action.indPoints = givenPoints;
                    setAppData(appData);
                }
            }}
        />
    </>
}

function RenderRightOrWrong({ questionPart, action }: { questionPart: RightOrWrong, action: ShowQuestionPart }) {
    const { appData, setAppData } = useAppDataContext();
    return <>
        <ButtonGroup>
            <ToggleButton
                type="radio"
                variant="outline-success"
                checked={action.indPoints === questionPart.pointsIfRight}
                id={"0"} value={"0"}
                onChange={(e) => {
                    action.indPoints = questionPart.pointsIfRight;
                    setAppData(appData);
                }}
            >
                Right Answer ({questionPart.pointsIfRight !== 0 ? (questionPart.pointsIfRight > 0 ? `+${questionPart.pointsIfRight}` : `${questionPart.pointsIfRight}`) : ''} {" "} points)
            </ToggleButton>
            <ToggleButton
                type="radio"
                variant="outline-danger"
                checked={action.indPoints === questionPart.pointsIfWrong} id={"1"} value={"1"}
                onChange={(e) => {
                    action.indPoints = questionPart.pointsIfWrong;
                    setAppData(appData);
                }}
            >
                Wrong Answer ({questionPart.pointsIfWrong !== 0 ? (questionPart.pointsIfWrong > 0 ? `+${questionPart.pointsIfWrong}` : `${questionPart.pointsIfWrong}`) : 'no'} {" "} points)
            </ToggleButton>
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
