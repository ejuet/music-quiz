import React from "react";
import { DisplayableText, PlayableSong, Question, QuestionPartP, RightOrWrong, ShowAnswerButton, SimpleQuestion, SimpleQuestionContent } from "../Logic/structure.ts";
import { RenderDisplayableText } from "../Common/DisplayableText.tsx";
import { Button, ButtonGroup } from "react-bootstrap";
import { PlayAudio } from "../Database/DatabaseComponents.tsx";
import { ShowQuestionPart } from "../Logic/gameStructure.ts";

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
            <RenderShowAnswerButton questionPart={part as ShowAnswerButton} modifyPoints={() => { }} />
        }
    </>
}

export function RenderQuestion({ question, modifyPoints }: { question: Question, modifyPoints: (points: number) => void }) {
    return <div>
        <small>Type: {question.questionType}</small>
        {
            question.getParts().map((part, index) => {
                const questionPart = part as QuestionPartP;
                return <div key={index}>
                    {
                        typeof part === 'string' &&
                        <p>{part}</p>
                    }
                    {
                        questionPart.partType === 'DisplayableText' &&
                        <RenderDisplayableText text={questionPart as DisplayableText} />
                    }
                    {
                        questionPart.partType === 'PlayableSong' &&
                        <PlayAudio filename={(questionPart as PlayableSong).filename} />
                    }
                    {
                        questionPart.partType === 'RightOrWrong' &&
                        <RenderRightOrWrong questionPart={questionPart as RightOrWrong} modifyPoints={modifyPoints} />
                    }
                    {
                        questionPart.partType === 'ShowAnswerButton' &&
                        <RenderShowAnswerButton questionPart={questionPart as ShowAnswerButton} modifyPoints={modifyPoints} />
                    }
                    </div>
            })
        }
    </div>
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

function RenderShowAnswerButton({ questionPart, modifyPoints }: { questionPart: ShowAnswerButton, modifyPoints: (points: number) => void }) {
    const [showAnswer, setShowAnswer] = React.useState(false);
    return <>
        {
            showAnswer ?
            <>
                <RenderDisplayableText text={questionPart.answer} />
                <RenderRightOrWrong questionPart={questionPart.RightOrWrong} modifyPoints={modifyPoints} />
            </>
            :
            <Button onClick={() => setShowAnswer(true)}>Show Answer</Button>
        }
    </>
}
