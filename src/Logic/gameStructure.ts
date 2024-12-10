import { MusicQuiz, PageBreak, Question, QuestionPartP } from "./structure.ts";

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

    getCurrentGame() {
        return this.gameActions.find(a => a instanceof PlayGame) ;
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

    getRemainingActions(){
        const leafActions = this.getLeafActions();
        const firstUnfinishedIndex = leafActions.findIndex(a => !a.finished);
        if(firstUnfinishedIndex === -1){
            return [];
        }
        return leafActions.slice(firstUnfinishedIndex);
    }


    getNextActionsToDisplay(startIndex: number = -1) {
        const nextActions = startIndex === -1 ? this.getRemainingActions() : this.getLeafActions().slice(startIndex);
        return SaveGame.untilNewPage(nextActions);
    }

    static untilNewPage(nextActions: LeafGameAction[]) {
        /*
            get the next actions to display on one page:
            - SelectQuestion gets an individual page,
            - Question Parts are displayed on one page until PageBreak
        */
        const ret: LeafGameAction[] = [];
        
        for(let i = 0; i < nextActions.length; i++){
            const action = nextActions[i];
            if(action instanceof SelectQuestion){
                ret.push(action);
                break;
            }
            if(action instanceof ShowQuestionPart){
                if(action.part instanceof PageBreak){
                    ret.push(action);
                    break;
                }
            }
            ret.push(action);
        }
        return ret;
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
    abstract getLeafActions(): LeafGameAction[];
}

export abstract class LeafGameAction extends GameAction {
    abstract setFinished(finished: boolean);
    getLeafActions() {
        return [this];
    }
}

export abstract class CompositeGameAction extends GameAction {
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
    setFinished(finished: boolean) {
        //do nothing
    }
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
            if(a instanceof SelectAndAnswerQuestion){
                if(a.teamId === teamId){
                    points += a.showQuestionParts.getPoints();
                }
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
    showQuestionParts: ShowQuestionParts;
    constructor(questions: Question[]) {
        super();
        this.selectQuestion = new SelectQuestion();
        this.showQuestionParts = new ShowQuestionParts(questions);
    }

    get actions() {
        //if the select question is finished, put the selected question id into the answer question
        if(this.selectQuestion.finished){
            this.showQuestionParts.questionId = this.selectQuestion.questionId;
        }

        //set the teamId for both actions
        this.selectQuestion.teamId = this.teamId;
        this.showQuestionParts.teamId = this.teamId;

        //TODO create a setter for questionID in the answer question. if we set it, have multiple points fields for each individual question in multiquestion

        return [this.selectQuestion, this.showQuestionParts];
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
    setFinished(finished: boolean) {
        //do nothing
    }
}


export class ShowQuestionParts extends CompositeGameAction {
    actionType: string = "ShowQuestionParts";
    allQuestions: Question[];
    questionParts: ShowQuestionPart[] = [];
    constructor(allQuestions: Question[]) {
        super();
        this.allQuestions = allQuestions;
    }

    _questionId: string = "";
    get questionId(){
        return this._questionId;
    }
    set questionId(questionId: string) {
        if(this._questionId !== questionId){
            this._questionId = questionId;
            this.questionParts = this.allQuestions.find(q => q.questionId === questionId)!.getParts().map(p => new ShowQuestionPart(p as QuestionPartP));
        }
    }

    get actions(): GameAction[] {
        return this.questionParts;
    }

    set teamId(teamId: string) {
        this.questionParts.forEach(p => p.teamId = teamId);
    }

    getPoints(){
        const ret =  this.questionParts.map(p => p.indPoints).reduce((acc, points) => acc + points, 0);
        return ret;
    }

}

export class ShowQuestionPart extends LeafGameAction {
    actionType: string = "ShowQuestionPart";
    teamId: string = "";
    constructor(public part: QuestionPartP){
        super()
    }
    _finished: boolean = false;
    get finished(): boolean {
        return this._finished;
    }
    setFinished(finished: boolean) {
        this._finished = finished;
    }
    indPoints: number = 0;
}

export class FinishGame extends LeafGameAction {
    actionType = "FinishGame";
    finished: boolean = false;
    teamStats: TeamStats[] = [];
    setFinished(finished: boolean) {
        //do nothing
    }
}

class TeamStats{
    teamId: string;
    points: number;
}

