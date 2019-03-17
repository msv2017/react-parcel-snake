import React from "react";
import { render } from "react-dom";
import "./sass/main.scss"

import Game from "./game/game";

const App = () =>{
  return (
    <div className="app">
      <Game />
    </div>
  )
};

render(<App />, document.getElementById("app"));