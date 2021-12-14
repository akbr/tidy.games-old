export interface Socket<I, O> {
  send: (input: I) => void;
  close: () => void;
  onopen?: () => void;
  onclose?: () => void;
  onmessage?: (output: O) => void;
}

export interface SocketServer<I, O> {
  onOpen: (socket: Socket<O, I>) => void;
  onClose: (socket: Socket<O, I>) => void;
  onInput: (socket: Socket<O, I>, action: I) => void;
  dump?: () => string;
  format?: (json: string) => void;
}
