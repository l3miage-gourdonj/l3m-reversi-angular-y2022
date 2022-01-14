import { Observable } from 'rxjs';                        // On importe la bilbiothèque RxJS

export type Turn = 'Player1' | 'Player2';                // Tour de jeu
export type C = 'Empty' | Turn;                       // Contenu d'une case du plateau

export type L = [C, C, C, C, C, C, C, C];             // Une ligne du plateau
export type Board = [L, L, L, L, L, L, L, L];             // Le plateau

export type R = readonly [C, C, C, C, C, C, C, C]; // Une ligne immuable
export type Board_RO = readonly [R, R, R, R, R, R, R, R]; // Un plateau immuable

export type TileCoords = readonly [x: number, y: number]; // Une coordonnée
export type PlayImpact = readonly TileCoords[];           // Une liste de coordonnées

export interface GameState {                              // Un état de jeu
     board: Board_RO;                                      // L'état du plateau
     turn: Turn;                                           // Le joueur pour qui c'est le tour de jouer
}

export interface ReversiModelInterface {                  // Le modèle du jeu Reversi, au sens MVP/MVC
     readonly board: Board_RO                              // Le plateau de jeu courant exposé en tant qu'objet immuable
     readonly turn: Turn                                   // Le joueur courant
     PionsTakenIfPlayAt(i: number, j: number): PlayImpact; // La liste des coordonnées des pions pris à l'adversaire
     whereCanPlay(): readonly TileCoords[]                 // Liste des positions jouable par le joueur courant
     play(i: number, j: number): void;                     // Joueur courant joue en <i, j>
     restart(gs: Partial<GameState>): void;                // Redémarre une partie à l'état initiale ou à l'état board / turn

     gameStateObs: Observable<GameState>;                  // Un observable de l'état courant du jeu
}

/**
 * Génère un nouveau plateau de jeu.
 * @returns un plateau de jeu vide de tout pion
 */
export function getEmptyBoard(): Board {
     return new Array(8).fill(0).map(
          () => new Array<C>(8).fill('Empty')
     ) as Board;
}


export function charToTurn(c: string): Turn {
     return c === 'X' ? 'Player1' : 'Player2';
}

export function chatToC(c: string): C {
     return c === '.' ? 'Empty' : charToTurn(c);
}

export function stringToBoard(str: string): Board {
     return str.trim().split("\n").map(
          s => s.trim().split('').map(chatToC) as L
     ) as Board;
}

export function cToString(c: C): string {
     switch (c) {
          case 'Empty': return ".";
          case 'Player1': return "X";
          case 'Player2': return "O";
     }
}

export function LtoString(L: R): string {
     return L.reduce((acc, c) => `${acc}${cToString(c)}`, '');
}

export function BoardtoString(b: Board_RO): string {
     return b.map(LtoString).join("\n");
}
