import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
  fooEvents: [],
  barEvents: []
});

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";
const URL = "http://127.0.0.1:5000";

export const socket = io(URL,{
  autoConnect: false,
  transports: ['websocket'], // 仅使用WebSocket传输协议
  extraHeaders: {
    'Access-Control-Allow-Origin': '*', // 设置跨域请求头
  },
});

socket.on("connect", () => {
  state.connected = true;
  console.log("Connected to server");
});

socket.on("disconnect", () => {
  state.connected = false;
});

// socket.on("foo", (...args) => {
//   state.fooEvents.push(args);
// });

// socket.on("bar", (...args) => {
//   state.barEvents.push(args);
// });



