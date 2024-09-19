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

const PlayableSongDef = t.type({
    filename: t.string
});

const RightOrWrongDef = t.type({
    pointsIfRight: t.number,
    pointsIfWrong: t.number
});

const SimpleTextDef = t.type({
    text: t.string
    //add other properties for displaying text here
});
const DisplayableText = t.union([SimpleTextDef, t.string]);


const QuestionPartDef = t.union([SimpleTextDef, PlayableSongDef, RightOrWrongDef, DisplayableText]);
export type QuestionPart = t.TypeOf<typeof QuestionPartDef>;

// ---------- Define the different types of "Questions" ----------

// -- A question with multiple parts
const QuestionWithPartsDef = t.type({
    parts: t.array(QuestionPartDef)
});
export type QuestionWithParts = t.TypeOf<typeof QuestionWithPartsDef>;
export class QuestionWithPartsWrapper implements QuestionWrapper {
    question: QuestionWithParts;

    constructor(question: QuestionWithParts) {
        this.question = question;
    }

    getParts(): QuestionPart[] {
        return this.question.parts;
    }
}

// -- An ordinary music quiz question
const SimpleQuestionDef = t.type({
    question: DisplayableText,
    song: PlayableSongDef,
    pointsIfRight: t.number,
    answer: DisplayableText
});
export type SimpleQuestion = t.TypeOf<typeof SimpleQuestionDef>;
export class SimpleQuestionWrapper implements QuestionWrapper {
    question: SimpleQuestion;

    constructor(question: SimpleQuestion) {
        this.question = question;
    }

    getParts(): QuestionPart[] {
        return [
            this.question.question,
            this.question.song,
            {
                pointsIfRight: this.question.pointsIfRight,
                pointsIfWrong: 0
            },
            this.question.answer
        ];
    }
}

// ---------- Define the "Question" type ----------
const QuestionDef = t.union([QuestionWithPartsDef, SimpleQuestionDef, QuestionPartDef]);

export type Question = t.TypeOf<typeof QuestionDef>;


// ---------- Utility ----------
export interface QuestionWrapper {
    getParts(): QuestionPart[];
}

export class QuestionWrapperFactory {
    static create(question: Question): QuestionWrapper {
        if (isRight(QuestionWithPartsDef.decode(question))) {
            return new QuestionWithPartsWrapper(question as QuestionWithParts);
        } else if (isRight(SimpleQuestionDef.decode(question))) {
            return new SimpleQuestionWrapper(question as SimpleQuestion);
        } else if (isRight(QuestionPartDef.decode(question))) {
            return new QuestionPartWrapper(question as QuestionPart);
        } else {
            throw new Error('Invalid question type');
        }
    }
}

export class QuestionPartWrapper implements QuestionWrapper {
    question: QuestionPart;

    constructor(question: QuestionPart) {
        this.question = question;
    }

    getParts(): QuestionPart[] {
        return [this.question];
    }
}

// ---------- Example usage ----------

const appData = new AppData();
appData.musicQuizzes = [
    {
        id: '1',
        name: 'Quiz 1',
        items: [
            {
                question: "What is the capital of France?",
                song: {
                    filename: 'song.mp3'
                },
                pointsIfRight: 10,
                answer: {
                    text: 'Paris'
                }
            }
        ]
    }
];

console.log(isRight(SimpleQuestionDef.decode(appData.musicQuizzes[0].items[0]))); // true
console.log(QuestionWrapperFactory.create(appData.musicQuizzes[0].items[0]).getParts());