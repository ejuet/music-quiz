import React from 'react';
import { AppData, MusicQuiz, Question } from '../../Logic/structure.ts';
import { useCurrentQuiz } from '../../Logic/AppDataContext.tsx';
import { QuestionWrapperFactory } from '../../Logic/QuestionWrapper.ts';
import { Table } from 'react-bootstrap';

export function Grid(){
    const currentQuiz = useCurrentQuiz();
    const allPoints = Array.from(new Set(currentQuiz!.items.map((item)=> QuestionWrapperFactory.create(item).getPoints()))).sort()

    return (
        <div>
            <h1>Grid</h1>
            <p style={{whiteSpace: 'pre-wrap'}}>{JSON.stringify(currentQuiz, null, 4)}</p>
            <Table>
                <thead>
                    <tr>
                        <th>Category</th>
                        {
                            allPoints.map((points) => <th>{points} Punkte</th>)
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        currentQuiz?.categories.map((category) => {
                            const questions = currentQuiz.items.filter((item) => item.category === category.id) as Question[];
                            const questionsWrapped = questions.map((question) => QuestionWrapperFactory.create(question)).sort((a, b) => a.getPoints() - b.getPoints());
                            return <tr>
                                <td>{category.name}</td>
                                {
                                    allPoints.map((points) => {
                                        const question = questionsWrapped.find((question) => question.getPoints() === points);
                                        return <td>
                                            {
                                                JSON.stringify(question?.getParts())
                                            }
                                        </td>
                                    })
                                }
                            </tr>
                        })
                    }
                </tbody>
            </Table>
        </div>
    )
}