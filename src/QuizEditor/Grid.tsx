import React from 'react';
import { Category, MultiQuestion, MusicQuiz, Question, questionTypes, SimpleQuestion } from '../Logic/structure.ts';
import { useAppDataContext, useCurrentQuiz } from '../Logic/AppDataContext.tsx';
import { Button, Table } from 'react-bootstrap';
import { EditNumber, EditQuestion, EditText } from './QuestionEditor/EditQuestion.tsx';
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { isRight } from 'fp-ts/lib/Either';
import { Dropdown } from 'react-bootstrap';
import DeleteButton from '../Common/DeleteButton.tsx';

interface QuizGridProps {
    quiz: MusicQuiz
    renderQuestions: (question: Question[], category: Category, points: number) => JSX.Element
    renderCategory?: (category: Category) => JSX.Element
    renderPoints?: (points: number) => JSX.Element
    renderAdditionalColumns?: (category: Category) => JSX.Element
    renderAdditionalRows?: () => JSX.Element
}

export function QuizGrid({
    quiz,
    renderQuestions,
    renderCategory = (category) => <>{category.name}</>,
    renderPoints = (points) => <>{points}</>,
    renderAdditionalColumns = () => <></>,
    renderAdditionalRows = () => <></>,
}: QuizGridProps) {
    const props = {
        quiz,
        renderQuestions,
        renderCategory,
        renderPoints,
        renderAdditionalColumns,
        renderAdditionalRows
    }
    return (
        <div>
            <Table>
                <thead>
                    <tr>
                        <th>Category</th>
                        {
                            props.quiz.items.map((item) => item.getPoints()).filter((value, index, self) => self.indexOf(value) === index).sort((a, b) => a - b).map((points) => <th key={points} >{props.renderPoints(points)}</th>)
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        props.quiz.categories.map((category) => {
                            const questions = props.quiz.items.filter((item) => item.category === category.id) as Question[];
                            return <tr key={category.id}>
                                <td>
                                    {props.renderCategory(category)}
                                </td>
                                {
                                    props.quiz.items.map((item) => item.getPoints()).filter((value, index, self) => self.indexOf(value) === index).sort((a, b) => a - b).map((points) => {
                                        const questionsInColumn = questions.filter((question) => question.getPoints() === points);
                                        return <td key={category.id + "-" + points} style={{ maxWidth: (1 / props.quiz.items.length) * 60 + "vw" }}>
                                            {props.renderQuestions(questionsInColumn, category, points)}
                                        </td>
                                    })
                                }
                                {props.renderAdditionalColumns(category)}
                            </tr>
                        })
                    }
                    {props.renderAdditionalRows()}
                </tbody>
            </Table>
        </div>
    )
}

export function Grid(){
    const currentQuiz = useCurrentQuiz()
    const {setAppData, appData} = useAppDataContext()
    if(!currentQuiz){
        return <h1>Quiz not found</h1>
    }
    return <QuizGrid
        quiz={currentQuiz}
        renderQuestions={(questions, category, points) => {
            return <>
                {
                    questions.map((question, ind) => <EditQuestion key={ind} question={question} replaceQuestion={(q)=>{
                        const index = currentQuiz.items.indexOf(question);
                        if(index === -1){
                            console.log("Question not found");
                            return;
                        }
                        console.log("Replacing question at index "+index);
                        currentQuiz.items[index] = q;
                        setAppData(appData);
                    }} />)
                }
                {
                    questions.length === 0 &&
                    <AddQuestionOfTypeButton category={category} points={points} />
                }
            </>
        }} 
        renderCategory={(category) => {
            return <>
                <EditText text={category.name} onChange={(value) => category.name = value} />
                <br />
                <DeleteButton onDelete={() => {
                    currentQuiz.categories = currentQuiz.categories.filter((cat) => cat !== category);
                    currentQuiz.items = currentQuiz.items.filter((item) => item.category !== category.id);
                    setAppData(appData);
                }} customMessage={'Are you sure you want to delete the category "'+category.name+'"?'} />
            </>
        }}
        renderPoints={(points) => {
            return <EditPoints points={points} />
        }
        }
        renderAdditionalColumns={(category) => {
            return <td>
                <AddQuestionOfTypeButton category={category} />
            </td>
        }}
        renderAdditionalRows={() => {
            return <>
                <tr>
                    <td>
                        <AddCategoryButton />
                    </td>
                </tr>
            </>
        }}
    />
}

function EditPoints({points}: {points: number}){
    const {setAppData, appData} = useAppDataContext();
    const currentQuiz = useCurrentQuiz();
    const questionsWithPoints = currentQuiz?.items.filter((item) => item.getPoints() === points) as Question[];

    return <div style={{display: "inline-block"}}>
    <EditNumber number={points} onChange={(value) => {
        questionsWithPoints.forEach((question) => {
            if(question.questionType === "SimpleQuestion"){
                const parsedQuestion = question as SimpleQuestion
                parsedQuestion.content.pointsIfRight = value;
            }
            else if(question.questionType === "MultiQuestion"){
                const parsedQuestion = question as MultiQuestion
                parsedQuestion.setPoints(value);
            }
            else{
                console.log("Unsupported question type: "+question.questionType)
            }
            //TODO handle other question types, possibly via QuestionWrapper
        });
        setAppData(appData);
    }}/>
    </div>
}

function AddQuestionButton({ category, points=0 }: { category: Category, points?: number }) {
    const currentQuiz = useCurrentQuiz();
    const {setAppData, appData} = useAppDataContext();

    return <Button variant="primary"
    style={{width: '100%'}}
    onClick={() => {
        const newQuestion = new SimpleQuestion();
        newQuestion.category = category.id;
        newQuestion.content.pointsIfRight = points? points : currentQuiz!.items.reduce((acc, item) => Math.max(acc, item.getPoints()), 0) + 10;
        currentQuiz!.items.push(newQuestion);
        setAppData(appData);
    }} >+</Button>
}

function AddQuestionOfTypeButton({ category, points=0 }: { category: Category, points?: number }) {
    const availableTypes = questionTypes
    const [showDropdown, setShowDropdown] = useState(false);
    const currentQuiz = useCurrentQuiz();
    const { setAppData, appData } = useAppDataContext();

    return (
        <>
            <Button variant="primary" style={{ width: '100%' }} onClick={() => setShowDropdown(!showDropdown)}>
                +
            </Button>
            {showDropdown && (
                <Dropdown.Menu show>
                    {availableTypes.map((type) => (
                        <Dropdown.Item
                            key={type.name}
                            onClick={() => {
                                const newQuestion = new type();
                                newQuestion.category = category.id;
                                newQuestion.setPoints(points? points : currentQuiz!.items.reduce((acc, item) => Math.max(acc, item.getPoints()), 0) + 10);
                                currentQuiz!.items.push(newQuestion);
                                setAppData(appData);
                                setShowDropdown(false);
                            }}
                        >
                            {type.name}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            )}
        </>
    );
}

function AddCategoryButton(){
    const currentQuiz = useCurrentQuiz();
    const {setAppData, appData} = useAppDataContext();

    return <Button variant="primary"
    style={{width: '100%'}}
    onClick={() => {
        currentQuiz!.categories.push({
            id: Math.random().toString(),
            name: 'New Category'
        });
        setAppData(appData);
    }} >Add Category</Button>
}
