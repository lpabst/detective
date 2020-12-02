import React, { useState } from 'react';
import game, { playerTypes } from './game.js';
import './App.css';

function App (){
  const [playerType, setPlayerType] = useState('');
  const [showControls, setShowControls] = useState(true);

  function startNewGame(playerType) {
    setShowControls(false);
    setPlayerType(playerType)
    game.init(playerType, gameEndCallback);
  }

  function gameEndCallback() {
    setShowControls(true);
  }

  return (
    <div className="detective">
      <div className="gameWrapper" >
        <p className='usernameDisplay'>Playing as: {playerType}</p>
        {showControls && (
          <div className='controls' >
            <div className='btn' id="startBtn" onClick={() => startNewGame(playerTypes.Detective)} >Play as Detective</div>
            <div className='btn' id="startBtn" onClick={() => startNewGame(playerTypes.Outlaw)} >Play as Outlaw</div>
          </div>
        )}

        <div className='canvasWrapper'>
          <canvas width='800' height='800' id='canvas'></canvas>
          <div id='messageDiv' ></div>
          <div id='typedWord' ></div>
        </div>

        <ul className='instructions'>
          <li>Click on a cell to move there</li>
          <li>If the detective lands within one square of the outlaw OR on the cell the outlaw just vacated, the detective wins</li>
          <li>If the outlaw survives 10 rounds, the outlaw wins</li>
        </ul>

      </div>

    </div>
  );
}

export default App;