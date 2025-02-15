import { Injectable } from '@angular/core';
import { BehaviorSubject, bufferTime } from 'rxjs';
import { ReversiGameEngineService } from './reversi-game-engine.service';
import { delay, filter, skipWhile } from 'rxjs/operators';
import { TileCoords } from './ReversiDefinitions';

@Injectable({
  providedIn: 'root',
})
export class IaService {
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
          const play = Math.floor(Math.random() * possiblePlays.length);
          RGS.play(possiblePlays[play][0], possiblePlays[play][1]);
        } else {
          console.log("Aucun coup possible pour l'ia");
        }
        //this.RGS.résuméDebug();
      });

    const subPlayed = RGS.gameStateObs.subscribe( _ => RGS.résuméDebug() );
    console.log('IA instanciée');
  }

}
