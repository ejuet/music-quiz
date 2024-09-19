import * as t from 'io-ts';
import { isRight } from 'fp-ts/Either';

export class AppData {
    musicQuizzes: MusicQuiz[];
}

export class MusicQuiz {
    id: string;
    name: string;
    items: QuizItem[];
}

export class QuizItem {
    parts: QuizItemPart[];
}

export class QuizItemPart{
}

export class Text extends QuizItemPart {
    text: string;
}

export class PlayableSong extends QuizItemPart {
    filename: string;
}

export class RightOrWrong extends QuizItemPart {
    pointsIfRight: number;
    pointsIfWrong: number;
}

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
                ] as QuizItemPart[]
            }
        ]
    }
] as MusicQuiz[];

function isInstance<T extends object>(obj: any, cls: new () => T): boolean {
    const instance = new cls();
    const instanceKeys = Object.keys(instance);
    const objKeys = Object.keys(obj);


    //for every key in the instance, check if the object has the same key and the same type
    return instanceKeys.every(key => {
        //if the object does not have the key, return false
        if (!objKeys.includes(key)) {
            return false;
        }
        const instanceValue = (instance as any)[key];
        const objValue = (obj as any)[key];

        console.log(instanceValue, objValue);

        console.log(typeof instanceValue, typeof objValue);

        if (typeof instanceValue === 'object' && instanceValue !== null) {
            return isInstance(objValue, instanceValue.constructor as new () => any);
        }

        return typeof instanceValue === typeof objValue;
    });
}

/*
console.log(appData.musicQuizzes[0].items[0].parts[0])
//console.log(isInstance(appData.musicQuizzes[0].items[0].parts[0], Text)); // What is the capital of France?
const roW = {
    pointsIfRight: 10,
    pointsIfWrong: 123
};
console.log(isInstance(roW, RightOrWrong)); // false
*/

// To make it easier to define questions, we define templates. their attributes can be copied into the parts array
export class SimpleQuestion {
    question: Text;
    song: PlayableSong;
    pointsIfRight: number;
    answer: Text;

    toQuizItem(): QuizItem {
        return {
            parts: [
                this.question,
                this.song,
                {
                    pointsIfRight: this.pointsIfRight,
                    pointsIfWrong: 0
                },
                this.answer
            ]
        }
    }
}
