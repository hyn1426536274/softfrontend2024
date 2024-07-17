<template>
  <div class="main">
    <div class="login_contain" v-if="is_login">
      <h3>Car Camera</h3>
      <!-- 当前用户 -->
      <p>当前车辆ID: {{ car_id }}</p>

      <p v-if="connected">状态: 已连接</p>
      <p v-else>状态: 未连接</p>

      <div v-if="connected">
        <img v-if="is_open_camera" ref="imgPlayer" alt="">
        <div>
          <div class="camera_btn" v-if="is_open_camera" @click="closeCamera">Close Camera</div>
          <div class="camera_btn" v-else @click="openCamera">Open Camera</div>
        </div>
      </div>

      <div class="conn_btn" v-if="connected" @click="disconnectSocket">Disconnect</div>
      <div class="conn_btn" v-else @click="connectSocket">Connect</div>


      <!-- <div>
        <input type="text" v-model="messageToSend" placeholder="Enter message">
        <button @click="sendMessage">Send Message</button>
      </div> -->

      <div class="server_res">
        <p id="res_title">服务器响应</p>
        <p> {{ newestRespose }} </p>
      </div>

    </div>

    <!-- 未登录 -->
    <div class="unlogin_contain" v-else>
      <!-- <p>{{ is_login }}</p> -->
      <h3>请先登录以连接小车</h3>
      <router-link to="/login" class="login_btn">登录</router-link>
    </div>
  </div>

</template>

<script>
import { io } from 'socket.io-client';

export default {
  name: "CameraView",
  data() {
    return {
      socket: null,
      connected: false,
      events: [],
      messageToSend: "",
      newestRespose: "",
      imgSrc: "",
      is_login: false,
      car_id: "",
      is_open_camera: false,
      lastKey: '',

      socketUrl: 'http://192.168.110.119:5000',
    };
  },
  async created() {
    await this.getData();
  },
  computed: {

  },
  mounted() {
    // this.connectSocket();
    console.log('mounted');
    window.addEventListener('keydown', this.handleKeydown);
  },
  methods: {
    async getData() {
      const query = this.$route.query;
      if (query.is_login) {
        this.is_login = query.is_login;

        this.car_id = query.car_id;
      }
    },
    handleKeydown(event) {
      this.lastKey = event.key; // 记录最后按下的键
      if(this.connected&&this.is_open_camera){
        this.socket.emit('control', `${event.key}`);
        // console.log(`Sent Key: ${event.key}`);
      }
    },
    connectSocket() {
      this.socket = io(this.socketUrl, {
        transports: ['websocket'], // 仅使用WebSocket传输协议
        extraHeaders: {
          'Access-Control-Allow-Origin': '*', // 设置跨域请求头
        },
      });

      // 处理连接成功事件
      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.connected = true;
      });

      // 处理断开连接事件
      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.connected = false;
      });

      // 示例：监听服务器发送的消息事件
      this.socket.on('res', (message) => {
        // console.log('Received message from server:', message);
        this.events.push(message);
        this.newestRespose = message.data;
      });
      this.socket.on('controlres', (message) => {
        // console.log('Received message from server:', message);
        this.events.push(message);
        this.newestRespose = message.data;
      });

      // 处理接收到视频流帧事件
      this.socket.on('video_frame', (data) => {
        // console.log(data);
        this.displayVideoFrame(data.data);
      });
    },

    openCamera() {
      this.socket.emit('req', 'open_camera 0');
      this.is_open_camera = true;
    },
    closeCamera() {
      this.socket.emit('req', 'close_camera 0');
      this.is_open_camera = false;
    },
    displayVideoFrame(frame) {
      if (this.$refs.imgPlayer) {
        this.$refs.imgPlayer.src = `data:image/jpeg;base64, ${frame}`;
      }
    },

    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.connected = false;
      }
    },
    // sendMessage() {
    //   if (this.socket && this.messageToSend.trim() !== "") {
    //     this.socket.emit('req', this.messageToSend);
    //     this.messageToSend = "";
    //   }
    // },
  },

  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
    window.removeEventListener('keydown', this.handleKeydown);
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Exo', sans-serif;
}

.main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  background-color: #f0f0f0;
}

.login_contain, .unlogin_contain {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login_btn{
  display: inline-block;
  padding: 4px 20px;
  background-color: #112D4E;
  color: #fff;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s;
}
.login_btn:hover{
  background-color: #1B4F72;
}
.camera_btn{
  display: inline-block;
  width: 120px;
  padding: 5px 0;
  margin: 5px;
  background-color: #007bff;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.camera_btn:hover{
  background-color: #0056b3;
}
.conn_btn{
  display: inline-block;
  width: 120px;
  padding: 5px 0;
  margin: 5px;
  background-color: #35dc51;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.conn_btn:hover{
  background-color: #49c823;
}

h3 {
  margin-bottom: 15px;
  color: #333;
}

p {
  margin-bottom: 10px;
  color: #555;
}

.connected {
  color: green;
}

.disconnected {
  color: red;
}

.video-frame {
  width: 100%;
  max-width: 640px;
  height: auto;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.control-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
}

.control-button:hover {
  background-color: #0056b3;
}

.control-button.disconnect {
  background-color: #dc3545;
}

.control-button.disconnect:hover {
  background-color: #c82333;
}

.control-button.connect {
  background-color: #28a745;
}

.control-button.connect:hover {
  background-color: #218838;
}

.server_res {
  margin-top: 20px;
  text-align: left;
  width: 100%;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  #res_title{
    font-size: 16px;
    color: #0e2464;
    margin-bottom: 10px;
    font-weight: bold;
  }
}

.login-link {
  text-decoration: none;
  color: #007bff;
  font-weight: bold;
  transition: color 0.3s;
}

.login-link:hover {
  color: #0056b3;
}
</style>