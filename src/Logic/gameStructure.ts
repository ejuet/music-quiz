import { MusicQuiz } from "./structure";

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
        this.gameActions = [];
        
        new Array(quiz.items.length).fill(0).forEach((_, i) => {
            const currentTeam = this.teams[i % this.teams.length];
            const n = new SelectAndAnswerQuestion()
            n.teamId = currentTeam.id;
            this.gameActions.push(n);
        });
    }

    getLeafActions() {
        return this.gameActions.map(a => {
            if ((a as CompositeGameAction).actions) {
                return (a as CompositeGameAction).actions;
            }
            return [a];
        }).flat();
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
}

abstract class LeafGameAction extends GameAction {
}

abstract class CompositeGameAction extends GameAction {
    abstract get actions(): GameAction[];
    get finished() {
        return this.actions.every(a => a.finished);
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

export class SelectAndAnswerQuestion extends CompositeGameAction {
    actionType = "SelectAndAnswerQuestion";
    teamId: string;
    selectQuestion: SelectQuestion;
    answerQuestion: AnswerQuestion;
    constructor() {
        super();
        this.selectQuestion = new SelectQuestion();
        this.answerQuestion = new AnswerQuestion();
    }

    get actions() {
        if(this.selectQuestion.finished){
            this.answerQuestion.questionId = this.selectQuestion.questionId;
        }
        return [this.selectQuestion, this.answerQuestion];
    }
}

export class SelectQuestion extends LeafGameAction {
    actionType = "SelectQuestion";
    questionId: string = "";
    get finished() {
        return this.questionId !== "";
    }
}

export class AnswerQuestion extends LeafGameAction {
    actionType = "AnswerQuestion";
    questionId: string = "";
    points: number = 0;
    finished = false;
}

