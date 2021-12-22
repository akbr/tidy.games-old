import { startServer } from "@lib/io/server/mounts/express-server";
import { engine } from "./engine";

startServer(engine);
