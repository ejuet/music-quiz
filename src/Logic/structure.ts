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
        const quiz = new MusicQuiz();
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
    created: Date;
    lastModified: Date;

    constructor() {
        this.id = Math.floor(Math.random() * 1000000).toString();
        this.name = "New Quiz";
        this.items = [];
        this.categories = [];
        this.created = new Date();
        this.lastModified = new Date();
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

export abstract class QuestionContent{
    abstract getParts(): QuestionPart[];
    abstract getPoints(): number;
    abstract setPoints(points: number): void; // This is used for moving the question from one column to another
}
export abstract class Question extends QuestionContent {
    abstract category: string;
    abstract questionType: string;
}

// They all intersect with this basic definition:
export abstract class BasicQuestion extends Question {
    category: string;
}


// --- An ordinary music quiz question ---
export class SimpleQuestionContent extends QuestionContent {
    question: DisplayableText;
    song: PlayableSong;
    pointsIfRight: number;
    answer: DisplayableText;

    constructor() {
        super();
        this.question = { text: "" };
        this.song = { filename: "" };
        this.pointsIfRight = 10; //this cant be 0 because at some point this would get serialized as null and throws errors
        this.answer = { text: "" };
    }

    getPoints(): number {
        return this.pointsIfRight;
    }

    getParts(): QuestionPart[] {
        return [this.question, this.song, { pointsIfRight: this.pointsIfRight, pointsIfWrong: 0 }, this.answer];
    }

    setPoints(points: number) {
        this.pointsIfRight = points;
    }
}

export class SimpleQuestion extends BasicQuestion {
    questionType: string = "SimpleQuestion";
    content: SimpleQuestionContent;

    constructor() {
        super();
        this.content = new SimpleQuestionContent();
    }

    getPoints(): number {
        return this.content.getPoints();
    }

    getParts(): QuestionPart[] {
        return this.content.getParts();
    }

    setPoints(points: number) {
        this.content.setPoints(points);
    }
}

export class MultiQuestion extends BasicQuestion {
    content: SimpleQuestionContent[]
    questionType: string = "MultiQuestion";

    constructor() {
        super();
        const x = new SimpleQuestionContent();
        //x.pointsIfRight = 10;
        this.content = [x];
    }

    getPoints(): number {
        return this.content.reduce((acc, question) => acc + question.getPoints(), 0);
    }

    getParts(): QuestionPart[] {
        return this.content.flatMap(question => question.getParts());
    }

    setPoints(points: number) {
        const totalPoints = this.getPoints();
        const factor = points / totalPoints;
        this.content.forEach(question => question.setPoints(question.getPoints() * factor));
    }
}

export const questionTypes = [SimpleQuestion, MultiQuestion];

//export type Question = QuestionWithParts | SimpleQuestion | OneQuestionPart;


// ---------- Example usage ----------

const appData = new AppData();
appData.musicQuizzes = [
    {
        id: '1',
        name: 'Quiz 1',
        created: new Date(),
        lastModified: new Date(),
        categories: [
            {
                id: '1',
                name: 'Category 1'
            }
        ],
        items: [
            {
                category: '1',
                content: {
                    question: { text: 'What is the capital of France?' },
                    song: { filename: 'Snowy Peaks pt II - Chris Haugen.mp3' },
                    pointsIfRight: 10,
                    answer: { text: 'Paris' }
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