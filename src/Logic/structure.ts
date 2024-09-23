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
}
questionWrappers[QuestionWithPartsDef.name] = q => new QuestionWithPartsWrapper(q);

// --- An ordinary music quiz question ---
const SimpleQuestionDef = t.intersection([
    BasicQuestionDef,
    t.type({
        question: DisplayableText,
        song: PlayableSongDef,
        pointsIfRight: t.number,
        answer: SimpleTextDef
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