import React from "react";
import { Button, ButtonGroup, Card, Dropdown, Form } from "react-bootstrap";
import { DisplayableText, Question, SimpleQuestion, SimpleQuestionDef } from "../../Logic/structure.ts";
import { isRight } from "fp-ts/lib/Either";
import * as t from 'io-ts';
import { useAppDataContext, useCurrentQuiz } from "../../Logic/AppDataContext.tsx";
import TextareaAutosize from 'react-textarea-autosize';

export function EditQuestion({ question }: { question: Question }) {
    return <Card className="p-2">
        {
            isRight(SimpleQuestionDef.decode(question)) &&
            <SimpleQuestionEditor question={question} />
        }
        <Form.Label>Category</Form.Label>
        <EditCategory category={question.category} onChange={(value) => question.category = value}/>
        <DeleteQuestionButton question={question}/>
    </Card>
}

function SimpleQuestionEditor({ question }: { question: SimpleQuestion }) {
    return <>
        <Form.Label>Question</Form.Label>
        <EditText text={question.question} onChange={(value) => question.question = value}/>
        <Form.Label>Answer</Form.Label>
        <EditText text={question.answer} onChange={(value) => question.answer = value}/>
        <Form.Label>Points</Form.Label>
        <EditNumber number={question.pointsIfRight} onChange={(value) => question.pointsIfRight = value}/>
    </>
}

function DeleteQuestionButton({ question }: { question: any }) {
    const {setAppData, appData} = useAppDataContext();
    const currentQuiz = useCurrentQuiz();

    return <Button variant="danger" className="mt-1" onClick={() => {
        currentQuiz!.items = currentQuiz!.items.filter((item) => item !== question);
        setAppData(appData);
    }} >Delete</Button>
}

export function EditText({ text, onChange }: { text: DisplayableText, onChange: (value: string) => void }) {
    const {setAppData, appData} = useAppDataContext();
    const handleChange = (e) => {
        onChange(e.target.value);
        setAppData(appData);
    };

    const textToEdit = typeof text === 'string' ? text : text.text;

    return <TextareaAutosize className="form-control" value={textToEdit} onChange={handleChange}/>
}

export function EditNumber({ number, onChange }: { number: number, onChange: (value: number) => void }) {
    const {setAppData, appData} = useAppDataContext();
    const handleChange = (e) => {
        const value = parseInt(e.target.value);
        onChange(value);
        setAppData(appData);
    };

    return <input 
        className="form-control" 
        defaultValue={number} 
        onBlur={handleChange} 
        onKeyUp={(e) => {
            if (e.key === 'Enter') {
                handleChange(e);
            }
        }}
        onInput={(e) => {
            const inputValue = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
            (e.target as HTMLInputElement).value = inputValue;
        }}
        style={{ 
            appearance: 'textfield', 
            MozAppearance: 'textfield', 
            width: `${number.toString().length + 3 +2}ch` 
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