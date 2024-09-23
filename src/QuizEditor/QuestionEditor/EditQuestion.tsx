import React from "react";
import { Button, ButtonGroup, Card, Dropdown, Form } from "react-bootstrap";
import { DisplayableText, RightOrWrong, SimpleQuestion, SimpleQuestionDef } from "../../Logic/structure.ts";
import { isRight } from "fp-ts/lib/Either";
import * as t from 'io-ts';
import { useAppDataContext, useCurrentQuiz } from "../../Logic/AppDataContext.tsx";
import TextareaAutosize from 'react-textarea-autosize';

export function EditQuestion({ question }: { question: any }) {
    if(isRight(SimpleQuestionDef.decode(question))) {
        const parsedQuestion = question as SimpleQuestion
        return <Card className="p-2">
                <Form.Label>Question</Form.Label>
                <EditText text={parsedQuestion.question} onChange={(value) => parsedQuestion.question = value}/>
                <Form.Label>Answer</Form.Label>
                <EditText text={parsedQuestion.answer} onChange={(value) => parsedQuestion.answer = value}/>
                <Form.Label>Points</Form.Label>
                <EditNumber number={parsedQuestion.pointsIfRight} onChange={(value) => parsedQuestion.pointsIfRight = value}/>
                <Form.Label>Category</Form.Label>
                <EditCategory category={parsedQuestion.category} onChange={(value) => parsedQuestion.category = value}/>
                <DeleteQuestionButton question={question}/>
            </Card>
    }
}

function DeleteQuestionButton({ question }: { question: any }) {
    const {setAppData, appData} = useAppDataContext();
    const currentQuiz = useCurrentQuiz();

    return <Button variant="danger" className="mt-1" onClick={() => {
        currentQuiz!.items = currentQuiz!.items.filter((item) => item !== question);
        setAppData(appData);
    }} >Delete</Button>
}

function EditText({ text, onChange }: { text: DisplayableText, onChange: (value: string) => void }) {
    const {setAppData, appData} = useAppDataContext();
    const handleChange = (e) => {
        onChange(e.target.value);
        setAppData(appData);
    };

    const textToEdit = typeof text === 'string' ? text : text.text;

    return <TextareaAutosize className="form-control" value={textToEdit} onChange={handleChange}/>
}

function EditNumber({ number, onChange }: { number: number, onChange: (value: number) => void }) {
    const {setAppData, appData} = useAppDataContext();
    const handleChange = (e) => {
        const value = parseInt(e.target.value);
        onChange(value);
        setAppData(appData);
    };

    return <input 
        type="number" 
        className="form-control" 
        defaultValue={number} 
        onBlur={handleChange} 
        onKeyUp={(e) => {
            if (e.key === 'Enter') {
                handleChange(e);
            }
        }}
    />
}

function EditCategory({ category, onChange }: { category: string, onChange: (value: string) => void }) {
    const {setAppData, appData} = useAppDataContext();
    const currentQuiz = useCurrentQuiz();

    return <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
            {currentQuiz?.categories.find((cat) => cat.id === category)?.name}
        </Dropdown.Toggle>

        <Dropdown.Menu>
            {
                currentQuiz?.categories.map((category) => {
                    return <Dropdown.Item key={category.id} onClick={() => {
                        onChange(category.id);
                        setAppData(appData);
                    }}>{category.name}</Dropdown.Item>
                })
            }
        </Dropdown.Menu>
    </Dropdown>
}