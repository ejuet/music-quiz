import * as t from 'io-ts';
import { isRight } from 'fp-ts/Either';
import { cons } from 'fp-ts/lib/ReadonlyNonEmptyArray';
import { questionWrappers, QuestionWrapper, QuestionWrapperFactory } from './QuestionWrapper.ts';

export class AppData {
    musicQuizzes: MusicQuiz[];
}

export interface MusicQuiz {
    id: string;
    name: string;
    items: Question[];
    categories: Category[];
}

export interface Category{
    id: string;
    name: string;
}


// ---------- Define the different types of "Question Parts" ----------

export const PlayableSongDef = t.type({
    filename: t.string
});

export const RightOrWrongDef = t.type({
    pointsIfRight: t.number,
    pointsIfWrong: t.number
});

export const SimpleTextDef = t.type({
    text: t.string
    //add other properties for displaying text here
});

const DisplayableTextDef = t.union([SimpleTextDef, t.string]);
export type DisplayableText = t.TypeOf<typeof DisplayableTextDef>;


const QuestionPartDef = t.union([SimpleTextDef, PlayableSongDef, RightOrWrongDef, DisplayableTextDef]);
export type QuestionPart = t.TypeOf<typeof QuestionPartDef>;

// ---------- Define the "Question" type ----------

// They all intersect with this basic definition:
const BasicQuestionDef = t.type({
    category: t.string
})

// --- A question with multiple parts ---
const QuestionWithPartsDef = t.intersection([
    BasicQuestionDef,
    t.type({
        parts: t.array(QuestionPartDef)
    })
]);

export type QuestionWithParts = t.TypeOf<typeof QuestionWithPartsDef>;
export class QuestionWithPartsWrapper implements QuestionWrapper {
    question: QuestionWithParts;

    constructor(question: QuestionWithParts) {
        this.question = question;
    }

    getParts(): QuestionPart[] {
        return this.question.parts;
    }

    getPoints(): number {
        return this.question.parts.reduce((acc, part) => {
            if (RightOrWrongDef.is(part)) {
                return acc + part.pointsIfRight;
            }
            return acc;
        }, 0);
    }
}
questionWrappers[QuestionWithPartsDef.name] = q => new QuestionWithPartsWrapper(q);

// --- An ordinary music quiz question ---
export const SimpleQuestionDef = t.intersection([
    BasicQuestionDef,
    t.type({
        question: DisplayableTextDef,
        song: PlayableSongDef,
        pointsIfRight: t.number,
        answer: DisplayableTextDef
    })
]);

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

    getPoints(): number {
        return this.question.pointsIfRight;
    }
}
questionWrappers[SimpleQuestionDef.name] = q => new SimpleQuestionWrapper(q);

// --- An individual question part ---
const OneQuestionPartDef = t.intersection([
    BasicQuestionDef,
    QuestionPartDef
]);
export type OneQuestionPart = t.TypeOf<typeof OneQuestionPartDef>;

export class QuestionPartWrapper implements QuestionWrapper<OneQuestionPart> {
    question: OneQuestionPart;

    constructor(question: OneQuestionPart) {
        this.question = question;
    }

    getParts(): OneQuestionPart[] {
        return [this.question];
    }

    getPoints(): number {
        if (RightOrWrongDef.is(this.question)) {
            return this.question.pointsIfRight;
        }
        return 0;
    }
}
questionWrappers[QuestionPartDef.name] = question => new QuestionPartWrapper(question);


export const questionDefinitions = [QuestionWithPartsDef, SimpleQuestionDef, QuestionPartDef]  as [t.Mixed, t.Mixed, t.Mixed];
const QuestionDef = t.union(questionDefinitions);

export type Question = t.TypeOf<typeof QuestionDef>;
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
            }
        ]
    }
];

/*
console.log(isRight(SimpleQuestionDef.decode(appData.musicQuizzes[0].items[0]))); // true
const parts = QuestionWrapperFactory.create(appData.musicQuizzes[0].items[0]).getParts()
console.log(parts);
console.log(isRight(DisplayableText.decode(parts[1])));
*/