export const isDev = () => location.hostname === "localhost";
export const getWSURL = () =>
  location.origin.replace(/^http/, "ws") + location.pathname;

export const getRoomURL = (roomId = "") => {
  const host = window.location.hostname.replace("www.", "");
  const port = location.port === "" ? "" : `:${location.port}`;
  const path = window.location.pathname;
  const hash = `#${roomId}`;

  return [location.protocol, "//", host, port, path, hash].join("");
};
