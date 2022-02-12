export interface Socket<Input, Output> {
  readonly send: (input: Input) => void;
  readonly close: () => void;
  onmessage?: (output: Output) => void;
  onopen?: () => void;
  onclose?: () => void;
}

export interface SocketServer<Input, Output> {
  onmessage: (socket: Socket<Input, Output>, output: Output) => void;
  onopen: (socket: Socket<Input, Output>) => void;
  onclose: (socket: Socket<Input, Output>) => void;
}

export type SocketOptions<Input, Output> = Omit<
  Socket<Input, Output>,
  "send" | "close"
>;

export function createWebSocket<Input, Output>(
  url: string,
  socketOptions: SocketOptions<Input, Output>
) {
  const websocket = new WebSocket(url);

  const clientSocket: Socket<Input, Output> = {
    ...socketOptions,
    send: (input) => {
      websocket.send(JSON.stringify(input));
    },
    close: () => {
      websocket.close();
    },
  };

  websocket.onopen = () => {
    if (clientSocket.onopen) clientSocket.onopen();
  };
  websocket.onclose = () => {
    if (clientSocket.onclose) clientSocket.onclose();
    cleanup();
  };
  websocket.onmessage = (x) => {
    if (clientSocket.onmessage) {
      clientSocket.onmessage(JSON.parse(x.data) as Output);
    }
  };

  function cleanup() {
    websocket.onopen = null;
    websocket.onmessage = null;
    websocket.onclose = null;
  }

  return clientSocket;
}

export function createLocalSocket<Input, Output>(
  server: SocketServer<Output, Input>,
  socketOptions: SocketOptions<Input, Output>
): Socket<Input, Output> {
  const clientSocket: Socket<Input, Output> = {
    ...socketOptions,
    send: (action) => {
      server.onmessage(serverSocket, action);
    },
    close: () => serverSocket.close(),
  };

  const serverSocket: Socket<Output, Input> = {
    send: (state) => {
      clientSocket.onmessage && clientSocket.onmessage(state);
    },
    close: () => {
      server.onclose(serverSocket);
    },
  };

  clientSocket.onopen && clientSocket.onopen();
  server.onopen(serverSocket);

  return clientSocket;
}

export function createSocketManager<Input, Output>(
  server: string | SocketServer<Output, Input>,
  socketInterface: SocketOptions<Input, Output>
): Socket<Input, Output> {
  let currentSocket: Socket<Input, Output> | null = null;
  let sendBuffer: Input[] = [];
  let connected = false;

  function close() {
    if (currentSocket) {
      currentSocket.close();
      currentSocket = null;
      sendBuffer = [];
    }
  }

  function open() {
    const options = {
      onopen: () => {
        connected = true;
        socketInterface.onopen && socketInterface.onopen();
        sendBuffer.forEach((action) => {
          currentSocket && currentSocket.send(action);
        });
      },
      onclose: () => {
        connected = false;
        socketInterface.onclose && socketInterface.onclose();
      },
      onmessage: socketInterface.onmessage || undefined,
    };

    currentSocket =
      typeof server === "string"
        ? createWebSocket<Input, Output>(server, options)
        : createLocalSocket(server, options);
  }

  open();

  return {
    send: (action: Input) => {
      if (!currentSocket) throw new Error("Socket manager has no open socket");
      if (!connected) {
        sendBuffer.push(action);
      } else {
        currentSocket.send(action);
      }
    },
    close,
  };
}
