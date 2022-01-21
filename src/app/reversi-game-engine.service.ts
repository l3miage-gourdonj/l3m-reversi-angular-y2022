import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
     Board,
     BoardtoString,
     Board_RO,
     C,
     charToTurn,
     GameState,
     getEmptyBoard,
     PlayImpact,
     ReversiModelInterface,
     TileCoords,
     Turn,
} from './ReversiDefinitions';

@Injectable({
     providedIn: 'root',
})
export class ReversiGameEngineService implements ReversiModelInterface {
     // NE PAS MODIFIER
     protected gameStateSubj = new BehaviorSubject<GameState>({
          board: getEmptyBoard(),
          turn: 'Player1',
     });
     public readonly gameStateObs: Observable<GameState> =
          this.gameStateSubj.asObservable();

     // NE PAS MODIFIER
     constructor() {
          this.restart();
          // NE PAS TOUCHER, POUR LE DEBUG DANS LA CONSOLE
          (window as any).RGS = this;
          console.log(
               "Utilisez RGS pour accéder à l'instance de service ReversiGameEngineService.\nExemple : RGS.résuméDebug()"
          );
     }

     résuméDebug(): void {
          console.log(`________
${BoardtoString(this.board)}
________
Au tour de ${this.turn}
X représente ${charToTurn('X')}
O représente ${charToTurn('O')}
________
Coups possibles (${this.whereCanPlay().length}) :
${this.whereCanPlay()
                    .map((P) => `  * ${P}`)
                    .join('\n')}
    `);
     }

     // NE PAS MODIFIER
     get turn(): Turn {
          return this.gameStateSubj.value.turn;
     }

     get board(): Board_RO {
          return this.gameStateSubj.value.board;
     }

     // NE PAS MODIFIER
     restart({ turn, board }: Partial<GameState> = {}): void {
          const gs = this.initGameState();
          let newBoard: Board;
          let newTurn: Turn;

          newBoard = !!board
               ? (board.map((L) => [...L]) as Board)
               : (gs.board as Board);
          newTurn = turn ?? gs.turn;

          this.gameStateSubj.next({
               turn: newTurn,
               board: newBoard,
          });
     }

     // NE PAS MODIFIER
     play(i: number, j: number): void {
          const { board: b1, turn: t1 } = this.gameStateSubj.value;
          const { board: b2, turn: t2 } = this.tryPlay(i, j);
          
          if (b1 !== b2 || t1 !== t2) {
               this.gameStateSubj.next({
                    turn: t2,
                    board: b2,
               });
               if (!this.canPlay()) {
                    this.gameStateSubj.next({
                         turn: t2 === 'Player1' ? 'Player2' : 'Player1',
                         board: b2,
                    });
               }
          }
     }

     //_______________________________________________________________________________________________________
     //__________________________________________ MODIFICATIONS ICI __________________________________________
     //_______________________________________________________________________________________________________

     /**
      * initGameState initialise un nouveau plateau à l'état initiale (2 pions de chaque couleurs).\
      * Initialise aussi le joueur courant.
      * @returns L'état initiale du jeu, avec les 4 pions initiaux bien placés.
      */
     private initGameState(): GameState {
          let board: Board = getEmptyBoard();
          let turn: Turn = 'Player1';
          board[4][4] = board[3][3] = 'Player2';
          board[4][3] = board[3][4] = 'Player1';
          return { turn, board };
     }

     /**
      * coordonatesInsideBoard indique si les coordonnées passées en paramètres sont celles d'une case du plateau
      * @param i 
      * @param j 
      * @returns true si la case est bien dans le plateau, false sinon
      */
     private coordonatesInsideBoard(i: number, j: number): boolean {
          return (i < this.board[0].length && j < this.board.length && i >= 0 && j >= 0);
     }

     /**
      * Renvoie la liste des positions qui seront prises si on pose un pion du joueur courant en position i,j
      * @param i Indice de la ligne où poser le pion
      * @param j Indice de la colonne où poser le pion
      * @returns Une liste des positions qui seront prise si le pion est posée en x,y
      */
     PionsTakenIfPlayAt(i: number, j: number): PlayImpact {
          let opponent: Turn = this.turn === 'Player1' ? 'Player2' : 'Player1';
          let pionsTaken: TileCoords[] = [];
          let pionsTemp: TileCoords[];
          [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]].forEach( ([horizontalMove,verticalMove]) => {
               let x: number = i + horizontalMove;
               let y: number = j + verticalMove;
               pionsTemp = [];
               while (this.coordonatesInsideBoard(x, y) && this.board[x][y] === opponent) {
                    pionsTemp.push([x, y]);
                    x += horizontalMove;
                    y += verticalMove;
               }
               if (this.coordonatesInsideBoard(x, y) && this.board[x][y] === this.turn) {
                    pionsTaken.push(...pionsTemp);
               }
          })
          return pionsTaken as PlayImpact;
     }

     /**
      * Liste les positions pour lesquels le joueur courant pourra prendre des pions adverse.
      * Il s'agit donc des coups possibles pour le joueur courant.
      * @returns liste des positions jouables par le joueur courant.
      */
     whereCanPlay(): readonly TileCoords[] {
          let playableTiles: TileCoords[] = [];
          this.board.forEach((line, i) => line.forEach((c, j) => {
                    if (c === 'Empty' && this.PionsTakenIfPlayAt(i, j).length > 0) {
                         playableTiles.push([i, j] as TileCoords);
                    }
               }))
          return playableTiles as PlayImpact;
     }

     /**
      * Le joueur courant pose un pion en i,j.
      * Si le coup n'est pas possible (aucune position de prise), alors le pion n'est pas joué et le tour ne change pas.
      * Sinon les positions sont prises et le tour de jeu change.
      * @param i L'indice de la ligne où poser le pion.
      * @param j L'indice de la colonen où poser le pion.
      * @returns Le nouvel état de jeu si le joueur courant joue en i,j, l'ancien état si il ne peut pas jouer en i,j
      */
     private tryPlay(i: number, j: number): GameState {
          let nextTurn:Turn = this.turn;
          let currentBoard: Board = this.board.map( r => r.slice() ) as Board;
          let whereCanPlay:TileCoords[] = [...this.whereCanPlay()]
          if(whereCanPlay.find(coord => coord[0] === i && coord[1] === j)){
               currentBoard[i][j] = this.turn;
               this.PionsTakenIfPlayAt(i,j).forEach( ([x,y]) => currentBoard[x][y] = this.turn);
               nextTurn = this.turn === 'Player1' ? 'Player2' : 'Player1';
          }
          return {turn: nextTurn, board: currentBoard};
     }

     /**
      * @returns vrai si le joueur courant peut jouer quelque part, faux sinon.
      */
     private canPlay(): boolean {
          return this.whereCanPlay().length > 0;
     }
}
