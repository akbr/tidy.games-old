import { createServer } from "./server";
import { createClient } from "./client";

const server = createServer();
export const client = createClient(server, "test");
