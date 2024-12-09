import { MultiQuestion, MusicQuiz, Question, SimpleQuestion } from "./structure.ts";

export class SaveGame {
    saveId: string;
    quizId: string;
    teams: Team[];
    created: Date;
    name: string;
    gameActions: GameAction[];

    constructor() {
        this.quizId = "";
        this.teams = [];
        this.created = new Date();
        this.name = "New Save";
        this.saveId = (Math.random() * 1000000).toString();
        this.gameActions = [];
    }

    startGame(quiz: MusicQuiz) {
        this.gameActions = [new PlayGame(quiz, this.teams)];
    }

    getCurrentPoints(teamId: string) {
        const playGame = this.gameActions.find(a => a.actionType === "PlayGame") as PlayGame;
        return playGame.getCurrentPoints(teamId);
    }

    getLeafActions() {
        return this.gameActions.map(a => {
            return a.getLeafActions();
        }).flat();
    }

    getNextAction(){
        const leafActions = this.getLeafActions();
        return leafActions.find(a => !a.finished);
    }

    getTeam(teamId: string) {
        return this.teams.find(t => t.id === teamId);
    }
}

export class Team {
    name: string;
    id: string;
    players: Player[];

    constructor() {
        this.players = [];
        this.id = (Math.random() * 1000000).toString();
        this.name = "";
    }
}

export class Player {
    name: string;
    id: string;

    constructor() {
        this.id = Math.random().toString();
        this.name = "";
    }
}


/*
export abstract class GameAction {
    abstract actionType: string;
    finished: boolean = false;
}

export abstract class TeamAction extends GameAction {
    teamId: string;
}

export class ChangePoints extends TeamAction {
    actionType: string = "ChangePoints";
    points: number = 0;
}

export abstract class QuestionAction extends TeamAction {
    questionId: string = "";
}

export class SelectQuestion extends QuestionAction {
    actionType: string = "SelectQuestion";
}

export class AnswerQuestion extends QuestionAction {
    actionType: string = "AnswerQuestion";
    points: number;
}
*/



export abstract class GameAction {
    abstract get finished(): boolean;
    abstract actionType: string;
    abstract getLeafActions(): GameAction[];
}

abstract class LeafGameAction extends GameAction {
    getLeafActions() {
        return [this];
    }
}

abstract class CompositeGameAction extends GameAction {
    abstract get actions(): GameAction[];
    get finished() {
        return this.actions.every(a => a.finished);
    }
    getLeafActions() {
        return this.actions.flatMap(a => a.getLeafActions());
    }
}

export class ChangePoints extends LeafGameAction {
    actionType = "ChangePoints";
    teamId: string;
    points: number;
    finished: boolean = true; //this action is always finished because it is only used for calculating the score
    constructor() {
        super();
    }
}

export class PlayGame extends CompositeGameAction {
    actionType = "PlayGame";
    _actions: GameAction[] = [];
    questionIds: string[] = [];
    teamIds: string[] = [];
    constructor(quiz: MusicQuiz, teams: Team[]) {
        super();
        this.questionIds = quiz.items.map(i => i.questionId);
        this.teamIds = teams.map(t => t.id);

        new Array(quiz.items.length).fill(0).forEach((_, i) => {
            const currentTeam = teams[i % teams.length];
            const n = new SelectAndAnswerQuestion(quiz.items)
            n.teamId = currentTeam.id;
            this._actions.push(n);
        });
    }

    getCurrentPoints(teamId: string) {
        var points = 0
        this._actions.forEach((a, i) => {
            if(a instanceof SelectAndAnswerQuestion && a.teamId === teamId){
                points += a.answerQuestion.points;
            }
        })
        return points;
    }

    get actions(){

        //set the available questions for each select question
        this._actions.forEach((a, i) => {
            if(a instanceof SelectAndAnswerQuestion){
                const takenQuestionIds = this._actions.slice(0, i).filter(a => a instanceof SelectAndAnswerQuestion).map(a => (a as SelectAndAnswerQuestion).selectQuestion.questionId);
                a.selectQuestion.availableQuestions = this.questionIds.filter(q => !takenQuestionIds.includes(q));
            }
        })

        //calculate the score for each team
        const finishGame = new FinishGame();
        finishGame.teamStats = this.teamIds.map(teamId => {
            const points = this.getCurrentPoints(teamId);
            return {teamId, points};
        });
        return [...this._actions, finishGame];
    }
}

export class SelectAndAnswerQuestion extends CompositeGameAction {
    actionType = "SelectAndAnswerQuestion";
    teamId: string;
    selectQuestion: SelectQuestion;
    answerQuestion: AnswerQuestion;
    constructor(questions: Question[]) {
        super();
        this.selectQuestion = new SelectQuestion();
        this.answerQuestion = new AnswerQuestion(questions);
    }

    get actions() {
        //if the select question is finished, put the selected question id into the answer question
        if(this.selectQuestion.finished){
            this.answerQuestion.questionId = this.selectQuestion.questionId;
        }

        //set the teamId for both actions
        this.selectQuestion.teamId = this.teamId;
        this.answerQuestion.teamId = this.teamId;

        //TODO create a setter for questionID in the answer question. if we set it, have multiple points fields for each individual question in multiquestion

        return [this.selectQuestion, this.answerQuestion];
    }
}

export abstract class TeamAction extends LeafGameAction {
    teamId: string;
}

export class SelectQuestion extends TeamAction {
    actionType = "SelectQuestion";
    questionId: string = "";
    availableQuestions: string[] = [];
    get finished() {
        return this.questionId !== "";
    }
}

export class AnswerQuestion extends TeamAction {
    finished: boolean = false;
    actionType = "AnswerQuestion";
    _questionID: string = "";
    get questionId() {
        return this._questionID;
    }
    leafs: AnswerQuestion[] = [];
    set questionId(value: string) {
        this._questionID = value;

        //if the question is a multi question, create a new answer question for each sub question
        if(this._questionID!=="" && this.leafs.length===0){
            const question = this.questions.find(q => q.questionId === this._questionID);
            if(question){
                console.log("found question", question);
                if(question.questionType=="MultiQuestion"){
                    const x = (question as MultiQuestion).content.map((content, i) => {
                        const a = new AnswerQuestion([]);
                        a.questionId = "";
                        a.teamId = this.teamId;
                        const newQ = new SimpleQuestion();
                        newQ.content = content;
                        a.questionToAnswer = newQ;
                        return a;
                    }) as this[];
                    this.leafs = x;
                }
                else{
                    this.questionToAnswer = question;
                }
            }
        }
    }
    
    _points: number = 0;
    get points() {
        if(this.questionToAnswer){
            console.log("returning points", this._points);
            return this._points
        }
        console.log("returning points", this.leafs.reduce((acc, a) => acc + a.points, 0));
        return this.leafs.reduce((acc, a) => acc + a.points, 0);
    }

    set points(value: number) {
        console.log("setting points", value);
        this._points = value;
    }

    questions: Question[];
    questionToAnswer: Question | undefined;
    constructor(questions: Question[]) {
        super();
        this.questions = questions;
    }

    getLeafActions(): this[] {
        if(this.questionId!=="" && this.leafs.length>0){
            return this.leafs as this[];
        }
        return [this];
    }
}

export class FinishGame extends LeafGameAction {
    actionType = "FinishGame";
    finished: boolean = false;
    teamStats: TeamStats[] = [];
}

class TeamStats{
    teamId: string;
    points: number;
}

