import { init } from "./init";

//window.location.hash = "#";
let { store, server, actions } = init();
/**

//@ts-ignore
window.server = server;

if (typeof server !== "string" && server.format) {
  server.format(
    '{"BBYT":{"id":"BBYT","state":false,"seats":[false,false,false,false],"spectators":[]}}'
  );
}

actions.join("BBYT");

**/
