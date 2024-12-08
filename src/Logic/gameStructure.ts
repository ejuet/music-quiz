export class SaveGame {
    saveId: string;
    quizId: string;
    teams: Team[];
    created: Date;
    name: string;

    constructor() {
        this.quizId = "";
        this.teams = [];
        this.created = new Date();
        this.name = "New Save";
        this.saveId = Math.random().toString();
    }
}

export class Team {
    name: string;
    id: string;
    players: Player[];
    gameActions: GameAction[];

    constructor() {
        this.players = [];
        this.id = Math.random().toString();
        this.name = "";
        this.gameActions = [];
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
