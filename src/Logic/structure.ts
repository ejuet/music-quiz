import * as t from 'io-ts';
import { isRight } from 'fp-ts/Either';

export class AppData {
    musicQuizzes: MusicQuiz[];
}

export interface MusicQuiz {
    id: string;
    name: string;
    items: Question[];
}


// Define the different types of "Question Parts"
const SimpleTextDef = t.type({
    text: t.string
});

const PlayableSongDef = t.type({
    filename: t.string
});

const RightOrWrongDef = t.type({
    pointsIfRight: t.number,
    pointsIfWrong: t.number
});

const QuestionPartDef = t.union([SimpleTextDef, PlayableSongDef, RightOrWrongDef]);

//Define the different types of "Questions"
const QuestionWithPartsDef = t.type({
    parts: t.array(QuestionPartDef)
});

const SimpleQuestionDef = t.type({
    question: SimpleTextDef,
    song: PlayableSongDef,
    pointsIfRight: t.number,
    answer: SimpleTextDef
});

const QuestionDef = t.union([QuestionWithPartsDef, SimpleQuestionDef, QuestionPartDef]);

export type Question = t.TypeOf<typeof QuestionDef>;


const appData = new AppData();
appData.musicQuizzes = [
    {
        id: '1',
        name: 'Quiz 1',
        items: [
            {
                parts: [
                    {
                        text: 'What is the capital of France?'
                    },
                    {
                        filename: 'song.mp3'
                    },
                    {
                        pointsIfRight: 10,
                        pointsIfWrong: 0
                    },
                    {
                        text: 'Paris'
                    }
                ]
            }
        ]
    }
];


// To make it easier to define questions, we define templates. their attributes can be copied into the parts array
/*
export class SimpleQuestion {
    question: SimpleText;
    song: PlayableSong;
    pointsIfRight: number;
    answer: SimpleText;

    toQuizItem(): Question {
        return {
            parts: [
                this.question,
                this.song,
                {
                    pointsIfRight: this.pointsIfRight,
                    pointsIfWrong: 0
                } as RightOrWrong,
                this.answer
            ]
        }
    }
}
    */
