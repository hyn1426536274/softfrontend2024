<template>
  <div class="title">
    <p>物体识别</p>
  </div>
  <div id="main">
    <div class="left-top">
      <div class="no_img_preview" v-show="!previewImage"></div>
      <div class="video_preview" v-show="previewImage && !is_shooted">
        <div id="cutdown"></div>
        <video ref="videoEl" class="mb-4" />
      </div>
      <div class="img_preview" ref="wrapper" v-show="is_shooted">
        <!-- <select v-if="cameras.length > 0" @change="handleCameraChange">
        <option v-for="camera in cameras" :key="camera.deviceId" :value="camera.deviceId">
          {{ camera.label }}
        </option>
      </select> -->
      </div>
    </div>

    <div class="left-bottom">
      <div class="btn_contain">
        <div class="take_photo" @click="shootcutdown">
          <div>
            <img src="../../public/images/icons/camera01.svg" alt="Camera">
          </div>
          <p v-show="!is_shooted">点击拍照</p>
          <p v-show="is_shooted">重新拍照</p>
        </div>

      </div>
    </div>
    <div class="right">
      <div class="grid_title">
        <p>聊天问答</p>
      </div>

      <div class="chat-container">
        <div class="chat-messages" ref="messagesContainer">
          <div v-for="message in messages" :key="message"
            :class="message.type === 'user' ? 'user-message' : 'bot-message'">
            <p class="text" v-html="renderMarkdown(message.text)">
            </p>
          </div>
        </div>
        <div class="chat-input" @click="startRecording" v-show="!isRecording">
          <div>
            <img src="../../public/images/icons/camera01.svg" alt="Camera">
          </div>
          <p>录音聊天</p>
        </div>
        <div v-show="ChatStep === 1">正在聆听……</div>
        <div v-show="ChatStep === 2">正在转文字……</div>
        <div v-show="ChatStep === 3">正在回答……</div>

        <div class="loading_contain">
          <div v-show="ChatStep === 1" id="siri-container"></div>
          <LoadingAnimation v-show="ChatStep != 1" />
        </div>
      </div>

    </div>




  </div>

</template>
<script>
import axios from 'axios';
axios.defaults.withCredentials = true;
import SiriWave from "siriwave";
import { parse } from 'marked';
import LoadingAnimation from '@/components/LoadingAnimation.vue';
// import { formatFileSize } from '@/utils.js';

export default {
  name: 'SingleImage',
  components: {
    LoadingAnimation
  },
  data() {
    return {
      previewImage: null,
      imgfile: null,

      devices: [],
      wrapper: [],
      videoEl: [],
      cameras: [],
      selectedCameraId: null,
      is_shooted: false,

      messages: [
        { type: 'bot', text: '先拍照，再提问。我可以识别物体哟~' },
      ],
      siriwave: null,
      isRecording: true,
      maxchat: 5,
      recordinterval: null,
      scrollinterval: null,
      audiopath: 'audio/audio.pcm',
      imagepath: 'image/tempobj.jpg',
      current_question: null,
      current_answer: null,
      ChatStep: 1, // 1:正在录音 2:录音结束 3:语音转文字 4:Spark对话
      chatEnabled: true, // 是否继续聊天(用于终止聊天循环)
    };
  },
  async mounted() {
    this.siriWave = new SiriWave({
      container: document.getElementById("siri-container"),
      width: 300,
      height: 160,
      style: "ios9",
      speed: 0.1,
    });

    this.scrollinterval = setInterval(() => {
      this.scrollToBottom();
    }, 100);

    window.addEventListener('mousewheel', () => {
      if (this.scrollinterval) {
        clearInterval(this.scrollinterval);
      }
    });

    this.chatLoop(); // 开启聊天循环

  },
  unmounted() {
    clearInterval(this.recordinterval);
    clearInterval(this.scrollinterval);
  },
  created() {
    this.first();
    this.getCameras();
  },
  methods: {
    first() {
      //首次运行引导用户，信任域名
      var first = window.localStorage.getItem('first');
      if (first == null) {
        if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
          //调用用户媒体设备, 访问摄像头
          navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 320 } });
        } else {
          alert('不支持访问用户媒体');
        }
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log('menumerateDevices is not supported!');
      } else {
        navigator.mediaDevices.enumerateDevices()
          .then(gotDevices).catch(handleError);
      }

      // 遍历所有的设备，包括视频和音频设备,找到摄像头
      function gotDevices(deviceInfos) {
        console.log(deviceInfos);
      }

      function handleError(error) {
        console.log('Error: ', error);
      }
    },
    async getCameras() {
      try {
        this.devices = await navigator.mediaDevices.enumerateDevices();
        console.log('devices:', this.devices.filter(device => device.kind === 'videoinput'));
        this.cameras.value = this.devices.filter(device => device.kind === 'videoinput');
        console.log('cameras:', this.cameras.value);
        console.log('cameras.value.length:', this.cameras.value);
        if (this.cameras.value.length > 0) {
          this.selectedCameraId = this.cameras.value[0].deviceId;

          console.log('selectedCameraId:', this.selectedCameraId);
          await this.startCamera(this.selectedCameraId);
          this.previewImage = 1;
        }
      } catch (error) {
        console.error('Error accessing camera devices:', error);
      }
    },
    async startCamera(deviceId) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            deviceId: { exact: deviceId },
            width: 400,
            height: 300,
            facingMode: 'user', // 默认前置摄像头
          },
        });
        this.videoEl.value = this.$refs.videoEl;
        this.wrapper.value = this.$refs.wrapper;
        if (this.videoEl.value) {
          this.videoEl.value.srcObject = stream;
          this.videoEl.value.play();
        }
      } catch (error) {
        console.error('Error starting camera:', error);
      }
    },
    async shootcutdown() {
      this.is_shooted = false;
      let countdownText = '3';
      const countdownInterval = setInterval(async () => {
        if (countdownText === '0') {
          countdownText = '3';
          clearInterval(countdownInterval);
          await this.shoot();
          this.is_shooted = true;
          console.log('Photo taken!');

          await this.uploadBase64Image(); // 作为本次聊天的携带图片上传
        }
        else {
          document.getElementById('cutdown').innerText = countdownText;
          countdownText = String(Number(countdownText) - 1);
        }
      }, 1000);
    },
    shoot() {
      if (this.videoEl.value && this.wrapper.value) {
        // 先移除之前的 canvas 元素，只显示最新的一张
        while (this.wrapper.value.firstChild) {
          this.wrapper.value.removeChild(this.wrapper.value.firstChild);
        }

        const canvas = document.createElement('canvas');
        canvas.width = this.videoEl.value.videoWidth;
        canvas.height = this.videoEl.value.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.videoEl.value, 0, 0, canvas.width, canvas.height);

        this.wrapper.value.appendChild(canvas);

        // 将 canvas 转为图片
        this.imgfile = canvas.toDataURL('image/png');
      }
    },

    handleCameraChange(event) {
      const deviceId = event.target.value;
      this.startCamera(deviceId);
    },
    renderMarkdown(text) {
      return parse(text);
    },
    async uploadBase64Image() {
      if (!this.imgfile) {
        alert('请上传图像');
        return;
      }
      const formData = new FormData();
      formData.append('image_base64', this.imgfile);
      formData.append('image_path', this.imagepath);
      try {
        const response = await axios.post('http://127.0.0.1:8000/上传Base64图像', formData,
          {
            headers: {
              // 'Content-Type': 'multipart/form-data'
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );
        console.log('response:', response.data);

      } catch (error) {
        console.error('Error:', error);
      }
    },
    ResponseFilter(str) {
      // 由于语音转文字API的问题，会重复返回两个相同的字符串
      // 获取字符串长度
      const length = str.length;

      // 如果字符串长度为奇数,则中间字符无法平分
      if (length % 2 !== 0) {
        return str;
      }

      // 将字符串分成前半部分和后半部分
      const firstHalf = str.slice(0, length / 2);
      const secondHalf = str.slice(length / 2);

      // 比较前半部分和后半部分是否相同
      if (firstHalf === secondHalf) {
        return firstHalf;
      } else {
        return str;
      }
    },
    async chat() {
      try {
        // 每次只能执行一个步骤
        console.log('chat');
        if(this.ChatStep === 1){
          await this.startRecording();
        }
        if(this.ChatStep === 2){
          await this.audioToText();
        }
        if(this.ChatStep === 3){
          await this.sparkChat();
        }
        
      } catch (error) {
        console.error(error);
      }
    },
    async chatLoop(){
      try{
        if(this.chatEnabled){
          await this.chat();
          this.chatLoop();
        }
      }
      catch (error) {
        console.error(error);
      }
    },
    stopChat() {
    this.chatEnabled = false;
  },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    },
    async startRecording() {
      try{
        console.log('Record Start', this.ChatStep, this.chatEnabled);
        const response = await axios.get('http://127.0.0.1:8000/录音');
        console.log(response.data.result);

        this.ChatStep = 2; // 语音转文字状态
      }
      catch (error) {
        this.stopChat();
        console.error(error);
      }

    },
    async audioToText() {
      try {
        const formData = new FormData();
        formData.append('AudioFile', this.audiopath);
        // const test = {AudioFile: this.audiopath};
        const response = await axios.post('http://127.0.0.1:8000/语音转文本', formData,
          {
            headers: {
              // 'Content-Type': 'multipart/form-data',
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          });

        console.log('response', response);
        this.current_question = this.ResponseFilter(response.data.result);
        if(this.current_question === '0'){
          this.messages.push({ type: 'bot', text: "对不起，没有听清，再说一遍哟~" });
          this.ChatStep = 1; // 重新进入语音录音状态
          return;
        }

        this.messages.push({ type: 'user', text: this.current_question });

        this.ChatStep = 3; // Spark对话状态
      } catch (error) {
        this.stopChat();
        console.error(error);
        
      }
    },
    async check_img()
    {
      if(!this.imgfile)
      {
        await this.shootcutdown();
      }
    },
    async sparkChat() {
      try {
        await this.check_img(); // await 不起作用？

        const formData = new FormData();
        formData.append('message', this.current_question);
        formData.append('image_path', this.imagepath);
        const response = await axios.post('http://127.0.0.1:8000/对象识别', formData,
          {
            headers: {
              // 'Content-Type': 'multipart/form-data'
              'Content-Type': 'application/json',
            },
            withCredentials: true
          });

        console.log(response.data);
        this.current_answer = response.data.result;
        this.messages.push({ type: 'bot', text: this.current_answer });

        this.ChatStep = 1; // 重新进入语音录音状态
      } catch (error) {
        this.stopChat();
        console.error(error);
      }
    },


  }// methods
}
</script>
<style scoped>
.title {
  position: absolute;
  width: 16%;
  left: 42%;
  top: 10px;

  p {
    color: white;
    font-weight: 500;
    font-size: 20px;
    background-color: rgba(0, 0, 0, 0.2);
    padding: 2px 0;
    border-radius: 5px;
  }
}


#main {
  background-image: url('../../public/images/waves/wave07.svg');
  background-size: cover;
  display: grid;
  padding-top: 80px;
  height: 100vh;
  grid-template-columns: 1fr 3fr;
  grid-template-rows: 3fr 1fr 1fr 1fr;
  gap: 10px;
  /* 可选：设置网格之间的间距 */
}

.left-top {
  grid-area: 1 / 1 / 3 / 2;

}

.left-bottom {
  grid-area: 3 / 1 / 5 / 2;

}

.right {
  grid-area: 1 / 2 / 5 / 5;
  background-color: rgba(208, 182, 255, 0.749);
  margin: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ffffff;

}


.btn_contain {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  border-radius: 8px;


  .take_photo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 60%;
    margin: 0 auto;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: all 0.3s;

    img {
      width: 50px;
      height: 50px;
    }

    p {
      margin: 5px 0;
      font-weight: bold;
    }

  }

  .take_photo {
    background-color: #906eec;

    p {
      color: #000000;
    }
  }

  .take_photo:hover {
    background-color: #785fba;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  }


}



.video_preview {
  width: 400px;
  height: 300px;
  margin: 10px;
  display: inline-block;
  position: relative;

  video {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }

  #cutdown {
    position: absolute;
    top: 100px;
    width: 100%;
    font-size: 100px;
    color: #DBE2EF;
  }

}

.img_preview {
  width: 400px;
  height: 300px;
  margin: 10px;
  display: inline-block;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.no_img_preview {
  width: 400px;
  height: 300px;
  margin: 2rem 0;
}


.img_info {
  width: 30%;

  p {
    margin: 5px 0;
    font-weight: bold;
    text-align: left;
  }

  span {
    margin-left: 10px;
    color: #09315E;
  }
}


.result_container {
  width: 30%;
  min-height: 100px;
  border-radius: 4px;
  border: 2px solid #072F5D;
  background-color: #DBE2EF;

  padding: 10px;

  p {
    text-align: left;
    font-weight: bold;
    color: #072F5D;
    margin: 1px 0;
  }

  .result_msg {
    padding-left: 10px;

    p {
      margin: 2px 0;
      color: #034e90;
    }
  }
}

/* 聊天部分 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 90%;
  width: 100%;
  background-size: cover;
  background-color: rgba(246, 236, 255, 0.68);
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.chat-input {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-top: 1px solid #ccc;
  cursor: pointer;
}

.user-message,
.bot-message {
  padding: 10px;
  border-radius: 10px;
  width: 100%;
  word-wrap: break-word;

  p {
    padding: 10px;
    border-radius: 10px;
    display: inline-block;

  }
}

.user-message {
  float: right;
  padding-left: 60%;
  text-align: right;

  p {
    background-color: #e1ffc7;
  }
}

.bot-message {
  float: left;
  padding-right: 60%;
  text-align: left;

  p {
    background-color: #f1f0f0;
  }

}
.loading_contain{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 160px;
  width: 100%;
}
/* 聊天部分: 结束 */
</style>