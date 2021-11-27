import { init } from "./init";

window.location.hash = "#";
let { store, server, actions } = init();

//@ts-ignore
window.server = server;

/**
 * if (typeof server !== "string" && server.format) {
  server.format(
    '{"BBYT":{"id":"BBYT","state":{"type":"play","turn":1,"dealer":0,"activePlayer":0,"hands":[["2|w"],[],[],[],[],[]],"trumpCard":"3|c","trumpSuit":"c","trick":["10|c","10|d","5|s","2|j","9|s"],"trickLeader":1,"trickWinner":null,"bids":[0,1,0,0,0,0],"actuals":[0,0,0,0,0,0],"scores":[],"options":{"canadian":false},"numPlayers":6},"seats":[false,false,false,false,false,false],"spectators":[]}}'
  );
}

 */
actions.join("BBYT");
