import * as t from 'io-ts';
import { isRight } from 'fp-ts/Either';
import { cons } from 'fp-ts/lib/ReadonlyNonEmptyArray';
//import { questionWrappers, QuestionWrapper, QuestionWrapperFactory } from './QuestionWrapper.ts';

export class AppData {
    musicQuizzes: MusicQuiz[];

    constructor() {
        this.musicQuizzes = [];
    }

    createMusicQuiz(): MusicQuiz {
        const quiz: MusicQuiz = {
            id: Math.floor(Math.random() * 1000000).toString(),
            name: "New Quiz",
            items: [],
            categories: []
        };
        this.musicQuizzes.push(quiz);
        return quiz;
    }

    deleteMusicQuiz(id: string) {
        this.musicQuizzes = this.musicQuizzes.filter(quiz => quiz.id !== id);
    }
}

export class MusicQuiz {
    id: string;
    name: string;
    items: Question[];
    categories: Category[];

    constructor() {
        this.id = Math.floor(Math.random() * 1000000).toString();
        this.name = "New Quiz";
        this.items = [];
        this.categories = [];
    }
}

export class Category{
    id: string;
    name: string;
}


// ---------- Define the different types of "Question Parts" ----------

export class PlayableSong {
    filename: string;
}

export class RightOrWrong {
    pointsIfRight: number;
    pointsIfWrong: number;
}

export class SimpleText {
    text: string;
    // add other properties for displaying text here
}

export type DisplayableText = SimpleText | string;

export type QuestionPart = SimpleText | PlayableSong | RightOrWrong | DisplayableText;

// ---------- Define the "Question" type ----------

export abstract class Question{
    abstract category: string;
    abstract questionType: string;
    abstract getParts(): QuestionPart[];
    abstract getPoints(): number;
}

// They all intersect with this basic definition:
export abstract class BasicQuestion extends Question {
    category: string;
}


// --- An ordinary music quiz question ---
export class SimpleQuestion extends BasicQuestion {
    questionType: string = "SimpleQuestion";
    question: DisplayableText;
    song: PlayableSong;
    pointsIfRight: number;
    answer: DisplayableText;

    constructor() {
        super();
        this.question = { text: "" };
        this.song = { filename: "" };
        this.pointsIfRight = 0;
        this.answer = { text: "" };
    }

    getPoints(): number {
        return this.pointsIfRight;
    }

    getParts(): QuestionPart[] {
        return [this.question, this.song, { pointsIfRight: this.pointsIfRight, pointsIfWrong: 0 }, this.answer];
    }
}

//export type Question = QuestionWithParts | SimpleQuestion | OneQuestionPart;


// ---------- Example usage ----------

const appData = new AppData();
appData.musicQuizzes = [
    {
        id: '1',
        name: 'Quiz 1',
        categories: [
            {
                id: '1',
                name: 'Category 1'
            }
        ],
        items: [
            {
                category: '1',
                question: "What is the capital of France?",
                song: {
                    filename: 'song.mp3'
                },
                pointsIfRight: 10,
                answer: {
                    text: 'Paris'
                }
            }  as SimpleQuestion
        ]
    }
];

/*
console.log(isRight(SimpleQuestionDef.decode(appData.musicQuizzes[0].items[0]))); // true
const parts = QuestionWrapperFactory.create(appData.musicQuizzes[0].items[0]).getParts()
console.log(parts);
console.log(isRight(DisplayableText.decode(parts[1])));
*/