import React from 'react';
import { Category, Question, SimpleQuestion, SimpleQuestionDef } from '../Logic/structure.ts';
import { useAppDataContext, useCurrentQuiz } from '../Logic/AppDataContext.tsx';
import { QuestionWrapperFactory } from '../Logic/QuestionWrapper.ts';
import { Button, Table } from 'react-bootstrap';
import { EditNumber, EditQuestion, EditText } from './QuestionEditor/EditQuestion.tsx';
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { isRight } from 'fp-ts/lib/Either';

export function Grid(){
    const currentQuiz = useCurrentQuiz();
    const {setAppData, appData} = useAppDataContext();

    // Get all unique points to display them in the table as columns
    const allPoints = currentQuiz? Array.from(new Set(currentQuiz!.items.map((item)=> QuestionWrapperFactory.create(item).getPoints()))).sort((a,b)=>a-b): []

    return (
        <div>
            <Button onClick={()=>{
                setAppData(appData)
            }} >Save</Button>
            <h1>Grid</h1>
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
                                    <DeleteCategoryButton category={category}/>
                                </td>
                                {
                                    allPoints.map((points) => {
                                        const questionsInColumn = questions.filter((question) => QuestionWrapperFactory.create(question).getPoints() === points);
                                        return <td key={category.id+"-"+points}>
                                            {
                                                questionsInColumn.map((question, ind) => <EditQuestion key={category.id+"-"+points+"-"+ind} question={question}/>)
                                            }
                                            {
                                                questionsInColumn.length === 0 &&
                                                <AddQuestionButton category={category} points={points}/>
                                            }
                                        </td>
                                    })
                                }
                                <td>
                                    <AddQuestionButton category={category}/>
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
    const questionsWithPoints = currentQuiz?.items.filter((item) => QuestionWrapperFactory.create(item).getPoints() === points) as Question[];

    return <div style={{display: "inline-block"}}>
    <EditNumber number={points} onChange={(value) => {
        questionsWithPoints.forEach((question) => {
            if(isRight(SimpleQuestionDef.decode(question))) {
                const parsedQuestion = question as SimpleQuestion
                parsedQuestion.pointsIfRight = value;
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
        currentQuiz!.items.push({
            category: category.id,
            question: '',
            pointsIfRight: points? points : currentQuiz!.items.reduce((acc, item) => Math.max(acc, item.pointsIfRight), 0) + 10,
            answer: '',
            song: {
                filename: ''
            }
        });
        setAppData(appData);
    }} >+</Button>
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


function DeleteCategoryButton({ category }: { category: Category }) {
    const currentQuiz = useCurrentQuiz();
    const { setAppData, appData } = useAppDataContext();
    const [showModal, setShowModal] = useState(false);

    const handleDelete = () => {
        currentQuiz!.categories = currentQuiz!.categories.filter((cat) => cat !== category);
        currentQuiz!.items = currentQuiz!.items.filter((item) => item.category !== category.id);
        setAppData(appData);
        setShowModal(false);
    };

    return (
        <>
            <Button variant="danger" className="mt-1" onClick={() => setShowModal(true)}>
                Delete
            </Button>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete the category "{category.name}"?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}