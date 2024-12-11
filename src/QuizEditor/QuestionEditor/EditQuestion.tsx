import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Dropdown, Form } from "react-bootstrap";
import { CustomQuestion, DisplayableText, MultiQuestion, PlayableSong, Question, QuestionPart, QuestionPartP, questionPartTypeList, RightOrWrong, SimpleQuestion, SimpleQuestionContent, SimpleText } from "../../Logic/structure.ts";
import { isRight } from "fp-ts/lib/Either";
import * as t from 'io-ts';
import { useAppDataContext, useCurrentQuiz } from "../../Logic/AppDataContext.tsx";
import TextareaAutosize from 'react-textarea-autosize';
import { getFilesFromIndexedDB } from "../../Logic/database.ts";
import { PlayAudio, useAudioFiles } from "../../Database/DatabaseComponents.tsx";
import { UploadSoundFile } from "../Media/DropZoneSound.tsx";
import DeleteButton from "../../Common/DeleteButton.tsx";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ButtonWithModal from "../../Common/ButtonWithModal.tsx";



export function EditQuestion({ question, replaceQuestion }: { question: Question, replaceQuestion: (newQuestion: Question) => void }) {
    const questionEditors: {
        [key: string]: (question: Question) => JSX.Element
    } = {
        'SimpleQuestion': (question) => <SimpleQuestionEditor question={(question as SimpleQuestion).content} />,
        'MultiQuestion': (question) => <MultiQuestionEditor question={(question as MultiQuestion)} />,
        'CustomQuestion': (question) => <CustomQuestionEditor question={(question as CustomQuestion)} />
    }
    return <Card className="p-2">
        <small>Type: {question.questionType}</small>
        {
            question.questionType !== "CustomQuestion" &&
            <ButtonWithModal buttonContent="Change Type" modalTitle="Change Question Type" onAction={()=>{
                const newQuestion = new CustomQuestion();
                newQuestion.content = question.getParts() as QuestionPartP[];
                newQuestion.setPoints(question.getPoints());
                newQuestion.category = question.category
                replaceQuestion(newQuestion);
            }} modalBody={"Do you really want to convert this question to a custom question? This action is irreversible."} />

        }
        <small>Question ID: {question.questionId}</small>
        {
            questionEditors.hasOwnProperty(question.questionType) &&
            questionEditors[question.questionType](question)
        }
        {
            !questionEditors.hasOwnProperty(question.questionType) &&
            <>
            {
                question.getParts().map((part, index) => {
                    return <div key={index}>
                        <EditQuestionPart question={question} partIndex={index} />
                    </div>
                })
            }
            </>
        }
        <Form.Label>Category</Form.Label>
        <EditCategory category={question.category} onChange={(value) => question.category = value} />
        <DeleteQuestionButton question={question} />
    </Card>
}

function CustomQuestionEditor({ question }: { question: CustomQuestion }) {
    const { setAppData, appData } = useAppDataContext();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = parseInt(active.id);
            const newIndex = parseInt(over.id);

            question.content = arrayMove(question.content, oldIndex, newIndex);
            setAppData(appData);
        }
    };

    return <>
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={question.content.map((_, index) => index.toString())} strategy={verticalListSortingStrategy}>
            {question.content.map((part, index) => (
                <SortableItem key={index} id={index.toString()}>
                    <div className="d-flex align-items-center w-100">
                        <div className="flex-grow-1">
                            <EditQuestionPart question={question} partIndex={index} />
                        </div>
                        <DeleteButton onDelete={() => {
                            question.content = question.content.filter((_, i) => i !== index);
                            setAppData(appData);
                        }} customMessage={"Are you sure you want to delete " + part.partType + "?"} />
                    </div>
                </SortableItem>
            ))}
        </SortableContext>
    </DndContext>
    <AddQuestionPartButton question={question} />
    </> 
}

export function SortableItem(props: { id: string, children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="d-flex align-items-center">
            <div className="drag-handle me-2" {...listeners} {...attributes} style={{ cursor: 'grab' }}>☰</div>
            <div className="flex-grow-1">
                {props.children}
            </div>
        </div>
    );
}

function AddQuestionPartButton({ question }: { question: CustomQuestion }) {
    const optionMap = questionPartTypeList
    const { setAppData, appData } = useAppDataContext();
    const [selectedPartType, setSelectedPartType] = useState(optionMap[0]);

    return (
        <ButtonGroup>
            <Button onClick={() => {
                question.content.push(new selectedPartType.type());
                setAppData(appData);
            }}>Add Part</Button>
            <Dropdown>
                <Dropdown.Toggle id="dropdown-basic">
                    {selectedPartType.name}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {
                        optionMap.map((option) => {
                            return <Dropdown.Item key={option.name} onClick={() => setSelectedPartType(option)}>{option.name}</Dropdown.Item>
                        })
                    }
                </Dropdown.Menu>
            </Dropdown>
        </ButtonGroup>
    );
}

function EditQuestionPart({ question, partIndex }: { question: Question, partIndex: number }) {
    const part = question.getParts()[partIndex] as QuestionPartP;
    const questionPartEditors: {
        [key: string]: (part: QuestionPartP, partIndex: number) => JSX.Element
    } = {
        'SimpleText': (part, partIndex) => <EditText text={part as DisplayableText} onChange={(value) => (part as SimpleText).text = value} />,
        'RightOrWrong': (part, partIndex) => <>
            <Form.Label>Points if right</Form.Label>
            <EditNumber number={(part as RightOrWrong).pointsIfRight || 0} onChange={(value) => (question.getParts()[partIndex] as RightOrWrong).pointsIfRight = value} />
            <Form.Label>Points if wrong</Form.Label>
            <EditNumber number={(part as RightOrWrong).pointsIfWrong || 0} onChange={(value) => (question.getParts()[partIndex] as RightOrWrong).pointsIfWrong = value} />
        </>,
        'PlayableSong': (part, partIndex) => <EditSong song={part as PlayableSong} onChange={(value) => question.getParts()[partIndex] = value} />
    }
    return <>
        {
            questionPartEditors.hasOwnProperty(part.partType) &&
            questionPartEditors[part.partType](part, partIndex)
        }
        {
            !questionPartEditors.hasOwnProperty(part.partType) &&
            <p>{part.partType}</p>
        }
    </>
}

function MultiQuestionEditor({ question }: { question: MultiQuestion }) {

    const { setAppData, appData } = useAppDataContext();
    return <>
        {
            question.content.map((simpleQuestion, index) => {
                return <div key={index} className="border p-2 mt-2">
                    <SimpleQuestionEditor question={simpleQuestion} />
                    <ButtonGroup>
                        <DeleteButton onDelete={() => {
                            question.content = question.content.filter((item) => item !== simpleQuestion);
                            setAppData(appData);
                        }} customMessage={"Are you sure you want to delete this question from the multi question?"} />
                    </ButtonGroup>
                </div>
            })
        }
        <ButtonGroup>
            <Button onClick={() => {
                question.content.push(new SimpleQuestionContent());
                setAppData(appData);
            }}>Add Question</Button>
        </ButtonGroup>
    </>
}

function SimpleQuestionEditor({ question }: { question: SimpleQuestionContent }) {
    return <>
        <Form.Label>Question</Form.Label>
        <EditText text={question.question} onChange={(value) => question.question = value} />
        <Form.Label>Song</Form.Label>
        <EditSong song={question.song} onChange={(value) => question.song = value} />
        <Form.Label>Answer</Form.Label>
        <EditText text={question.answer} onChange={(value) => question.answer = value} />
        <Form.Label>Points</Form.Label>
        <EditNumber number={question.pointsIfRight} onChange={(value) => question.pointsIfRight = value} />
    </>
}

function EditSong({ song, onChange }: { song: PlayableSong, onChange: (value: PlayableSong) => void }) {
    const { setAppData, appData } = useAppDataContext();
    const currentQuiz = useCurrentQuiz();
    const audioFiles = useAudioFiles();
    return <>
        <Dropdown>
            <Dropdown.Toggle id="dropdown-basic" style={{ width: "100%" }}>
                {song.filename != "" ? song.filename : "Select a song"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <Dropdown.Item>
                    {
                        song.filename !== "" &&
                        <Button variant="secondary" style={{ width: '100%' }}
                            onClick={() => {
                                onChange(new PlayableSong());
                                setAppData(appData);
                            }}
                        >
                            Clear Selection
                        </Button>
                    }
                </Dropdown.Item>

                <Dropdown.Item as="div">
                    <UploadSoundFile onUpload={(file) => {
                        const playSong = new PlayableSong();
                        playSong.filename = file.name;
                        onChange(playSong);
                        setAppData(appData);
                    }} />
                </Dropdown.Item>



                {
                    audioFiles.map((file) => {
                        return <Dropdown.Item key={file.name} onClick={() => {
                            const playSong = new PlayableSong();
                            playSong.filename = file.name;
                            onChange(playSong);
                            setAppData(appData);
                        }}>{file.name}</Dropdown.Item>
                    })
                }
            </Dropdown.Menu>
        </Dropdown>
        
        {
            song.filename !== "" &&
            <PlayAudio filename={song.filename} />
        }
    </>
}

function DeleteQuestionButton({ question }: { question: Question }) {
    const { setAppData, appData } = useAppDataContext();
    const currentQuiz = useCurrentQuiz();

    return <DeleteButton onDelete={() => {
        currentQuiz!.items = currentQuiz!.items.filter((item) => item !== question);
        setAppData(appData);
    }} customMessage={"Are you sure you want to delete this question?"} />
}

export function EditText({ text, onChange }: { text: DisplayableText, onChange: (value: string) => void }) {
    const { setAppData, appData } = useAppDataContext();
    const handleChange = (e) => {
        onChange(e.target.value);
        setAppData(appData);
    };

    const textToEdit = typeof text === 'string' ? text : text.text;

    return <TextareaAutosize className="form-control" value={textToEdit} onChange={handleChange} />
}

export function EditNumber({ number, onChange }: { number: number, onChange: (value: number) => void }) {
    const { setAppData, appData } = useAppDataContext();
    const handleChange = (e) => {
        var value = parseInt(e.target.value);
        if (isNaN(value)) {
            value = 0;
        }
        console.log(value);
        onChange(value);
        setAppData(appData);
    };

    return <input
        className="form-control"
        defaultValue={number}
        onBlur={handleChange}
        onKeyUp={(e) => {
            if(e.key === 'Enter') {
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
            width: `${number.toString().length + 3 + 2}ch`
        }}
    />
}

function EditCategory({ category, onChange }: { category: string, onChange: (value: string) => void }) {
    const { setAppData, appData } = useAppDataContext();
    const currentQuiz = useCurrentQuiz();

    return <Dropdown>
        <Dropdown.Toggle id="dropdown-basic">
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