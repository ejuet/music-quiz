import React from 'react';
import { Category, MultiQuestion, Question, questionTypes, SimpleQuestion } from '../Logic/structure.ts';
import { useAppDataContext, useCurrentQuiz } from '../Logic/AppDataContext.tsx';
import { Button, Table } from 'react-bootstrap';
import { EditNumber, EditQuestion, EditText } from './QuestionEditor/EditQuestion.tsx';
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { isRight } from 'fp-ts/lib/Either';
import { Dropdown } from 'react-bootstrap';
import DeleteButton from '../Common/DeleteButton.tsx';


export function Grid(){
    const currentQuiz = useCurrentQuiz();
    const {setAppData, appData} = useAppDataContext();

    // Get all unique points to display them in the table as columns
    //const allPoints = currentQuiz? Array.from(new Set(currentQuiz!.items.map((item)=> QuestionWrapperFactory.create(item).getPoints()))).sort((a,b)=>a-b): []

    const allPoints = currentQuiz?.items.map((item) => item.getPoints()).filter((value, index, self) => self.indexOf(value) === index).sort((a,b)=>a-b) || [];

    return (
        <div>
            <Table>
                <thead>
                    <tr>
                        <th>Category</th>
                        {
                            allPoints.map((points) => <th key={points} >{<EditPoints points={points} />} Punkte</th>)
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        currentQuiz?.categories.map((category) => {
                            const questions = currentQuiz.items.filter((item) => item.category === category.id) as Question[];
                            return <tr key={category.id}>
                                <td>
                                    <EditText text={category.name} onChange={(value) => category.name = value}/>
                                    <br />
                                    <DeleteButton onDelete={() => {
                                        currentQuiz.categories = currentQuiz.categories.filter((cat) => cat !== category);
                                        currentQuiz.items = currentQuiz.items.filter((item) => item.category !== category.id);
                                        setAppData(appData);
                                    }} customMessage={'Are you sure you want to delete the category "'+category.name+'"?'} />
                                </td>
                                {
                                    allPoints.map((points) => {
                                        const questionsInColumn = questions.filter((question) => question.getPoints() === points);
                                        return <td key={category.id+"-"+points} style={{maxWidth: (1/allPoints.length)*60+"vw"}}>
                                            {
                                                questionsInColumn.map((question, ind) => <EditQuestion key={category.id+"-"+points+"-"+ind} question={question}/>)
                                            }
                                            {
                                                questionsInColumn.length === 0 &&
                                                <AddQuestionOfTypeButton category={category} points={points}/>
                                            }
                                        </td>
                                    })
                                }
                                <td>
                                    <AddQuestionOfTypeButton category={category}/>
                                </td>
                            </tr>
                        })
                    }
                    <tr>
                        <td>
                            <AddCategoryButton/>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>
    )
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
