import { Injectable } from '@angular/core';
import { delay, filter } from 'rxjs/operators';
import { ReversiGameEngineService } from './reversi-game-engine.service';
import { TileCoords } from './ReversiDefinitions';

@Injectable({
  providedIn: 'root'
})
export class IameilleurepriseService {

  constructor(public RGS: ReversiGameEngineService) { 
    const subIA = RGS.gameStateObs
      .pipe(
        filter(game => game.turn === "Player2"),
        delay(3000)
      )
      .subscribe( _ => {
        //this.RGS.résuméDebug();
        const possiblePlays = RGS.whereCanPlay();
        if (possiblePlays.length > 0) {
          const bestPossiblePlay = possiblePlays.reduce( ([i,j], [x, y]) => this.RGS.PionsTakenIfPlayAt(x,y).length > this.RGS.PionsTakenIfPlayAt(i,j).length ? [x,y] : [i,j])
          RGS.play(bestPossiblePlay[0], bestPossiblePlay[1]);
        } else {
          console.log("Aucun coup possible pour l'ia");
        }
        //this.RGS.résuméDebug();
      });

    const subPlayed = RGS.gameStateObs.subscribe( _ => RGS.résuméDebug() );
    console.log('IA meilleure prise instanciée');
  }
}
