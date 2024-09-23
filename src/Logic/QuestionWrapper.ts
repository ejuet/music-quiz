import { isRight } from "fp-ts/lib/Either";
import { QuestionPart, Question, questionDefinitions } from "./structure.ts";

// ---------- Utility ----------

export const questionWrappers: { [key: string]: (question: any) => QuestionWrapper } = {};

export interface QuestionWrapper<T extends Question = Question> {
    getParts(): QuestionPart[];
    getPoints(): number;
}

export class QuestionWrapperFactory {
    static create(question: Question): QuestionWrapper {
        for(const def of questionDefinitions) {
            if(isRight(def.decode(question))) {
                console.log("found ", def.name);
                return questionWrappers[def.name](question as any);
            }
        }
        throw new Error('Could not find a Wrapper Class for ' + JSON.stringify(question));
    }
}


