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
        this.gameActions = [new PlayGame(quiz, this.teams)];
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
    actions: GameAction[] = [];
    constructor(quiz: MusicQuiz, teams: Team[]) {
        super();

        new Array(quiz.items.length).fill(0).forEach((_, i) => {
            const currentTeam = teams[i % teams.length];
            const n = new SelectAndAnswerQuestion()
            n.teamId = currentTeam.id;
            this.actions.push(n);
        });
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
        this.selectQuestion.teamId = this.teamId;
        this.answerQuestion.teamId = this.teamId;

        return [this.selectQuestion, this.answerQuestion];
    }
}

export abstract class TeamAction extends LeafGameAction {
    teamId: string;
}

export class SelectQuestion extends TeamAction {
    actionType = "SelectQuestion";
    questionId: string = "";
    get finished() {
        return this.questionId !== "";
    }
}

export class AnswerQuestion extends TeamAction {
    actionType = "AnswerQuestion";
    questionId: string = "";
    points: number = 0;
    finished = false;
}

