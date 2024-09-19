import { isRight } from "fp-ts/lib/Either";
import { QuestionPart, Question, questionDefinitions } from "./structure.ts";

// ---------- Utility ----------

export const questionWrappers: { [key: string]: new (question: Question) => QuestionWrapper } = {};

export interface QuestionWrapper {
    getParts(): QuestionPart[];
}

export class QuestionWrapperFactory {
    static create(question: Question): QuestionWrapper {
        for(const def of questionDefinitions) {
            if(isRight(def.decode(question))) {
                console.log("found ", def.name);
                return new questionWrappers[def.name](question as any);
            }
        }
        throw new Error('Could not find a Wrapper Class for ' + JSON.stringify(question));
    }
}


