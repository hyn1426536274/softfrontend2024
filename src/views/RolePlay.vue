<template>
  <div class="title">
    <p>角色模拟</p>
  </div>
  <div id="main">
    <div class="left-top">
      <div class="role_name">
        <p>{{ roles[this.current_role] }}</p>
      </div>
      <div class="role_img">
        <img id="roleimg" v-show="current_role === 0" src="../../public/images/roles/lb.jpg" alt="Role Image">
        <img id="roleimg" v-show="current_role === 1" src="../../public/images/roles/zg.jpg" alt="Role Image">
        <img id="roleimg" v-show="current_role === 2" src="../../public/images/roles/gs.jpg" alt="Role Image">
        <img id="roleimg" v-show="current_role === 3" src="../../public/images/roles/jll.jpg" alt="Role Image">
      </div>
    </div>

    <div class="left-bottom">
      <div class="role_change_note">
        <p>切换角色</p>
      </div>
      <div class="btn_contain">
        <div class="change_role" @click="changeRole(0)">{{ roles[0] }}</div>
        <div class="change_role" @click="changeRole(1)">{{ roles[1] }}</div>
        <div class="change_role" @click="changeRole(2)">{{ roles[2] }}</div>
        <div class="change_role" @click="changeRole(3)">{{ roles[3] }}</div>
      </div>
    </div>
    <div class="right">
      <div class="grid_title">
        <p>聊天问答</p>
      </div>

      <div class="chat-container">
        <div class="chat-messages" ref="messagesContainer">
          <div v-for="message in messages[this.current_role]" :key="message"
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
      cameras: [],
      selectedCameraId: null,
      is_shooted: false,

      messages: [
        [
          { type: 'bot', text: "你好，我是李白，有什么问题可以问我哟~" },
        ],
        [
          { type: 'bot', text: "你好，我是诸葛亮，有什么问题可以问我哟~" },
        ],
        [
          { type: 'bot', text: "你好，我是高斯，有什么问题可以问我哟~" },
        ],
        [
          { type: 'bot', text: "你好，我是伽利略，有什么问题可以问我哟~" },
        ],
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
      roles: ['李白', '诸葛亮', '高斯', '伽利略'],
      current_role: 0, // 1:李白 2:诸葛亮 3:高斯 4:伽利略
      // role_img_path: [
      //   '../../public/images/roles/lb.jpg', 
      //   '../../public/images/roles/zg.jpg', 
      //   '../../public/images/roles/gs.jpg', 
      //   '../../public/images/roles/jll.jpg'
      // ],
      role_id: [
        'b505bf4d019ebbe852f49b212e70a1ec', // 李白
        '31bea398de488dccb6b8d94a22ee8fca', // 诸葛亮
        'e0f55407b476d0a3a8521aaba3b9eeda', // 高斯
        '24bc8c9e8db531aa55c67f466594a9f2' // 伽利略
      ],
      role_chatid: [ // 分别计数
        1,
        1,
        1,
        1,
      ]
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

    for (let i = 0; i < this.role_id.length; i++) {
      this.clearChatRecord(this.role_id[i]);
    }
  },
  methods: {

    changeRole(role) {
      this.current_role = role;
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
        if (this.ChatStep === 1) {
          await this.startRecording();
        }
        if (this.ChatStep === 2) {
          await this.audioToText();
        }
        if (this.ChatStep === 3) {
          await this.sparkChat();
        }

      } catch (error) {
        console.error(error);
      }
    },
    async chatLoop() {
      try {
        if (this.chatEnabled) {
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
      try {
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
        if (this.current_question === '0') {
          this.messages[this.current_role].push({ type: 'bot', text: "对不起，没有听清，再说一遍哟~" });
          this.ChatStep = 1; // 重新进入语音录音状态
          return;
        }

        this.messages[this.current_role].push({ type: 'user', text: this.current_question });

        this.ChatStep = 3; // Spark对话状态
      } catch (error) {
        this.stopChat();
        console.error(error);

      }
    },

    async sparkChat() {
      try {
        const formData = new FormData();
        formData.append('msg', this.current_question);
        if (this.role_chatid[this.current_role] <= 1) {
          // 第一次问答 chatid = prechatid
          formData.append('chatid', this.role_chatid[this.current_role]);
          formData.append('prechatid', this.role_chatid[this.current_role]);
          this.role_chatid[this.current_role] = this.role_chatid[this.current_role] + 1;
        }
        else {
          formData.append('chatid', this.role_chatid[this.current_role]);
          formData.append('prechatid', this.role_chatid[this.current_role]-1);
          this.role_chatid[this.current_role] = this.role_chatid[this.current_role] + 1;
        }

        formData.append('agentid', this.role_id[this.current_role]);
        console.log('formData:', this.current_question, this.role_chatid[this.current_role] + 1, this.role_chatid[this.current_role], this.role_id[this.current_role]);
        const response = await axios.post('http://127.0.0.1:5000/talk', formData,
          {
            headers: {
              // 'Content-Type': 'multipart/form-data'
              'Content-Type': 'application/json',
            },
          });
        

        console.log(response.data);
        this.current_answer = response.data.message;
        if (!response.data.message) {
          this.messages[this.current_role].push({ type: 'bot', text: "对不起，我不知道怎么回答你的问题" });
          this.ChatStep = 1; // 重新进入语音录音状态
          return;
        }
        console.log('current_answer:', this.current_answer);
        this.messages[this.current_role].push({ type: 'bot', text: this.current_answer });

        this.ChatStep = 1; // 重新进入语音录音状态
      } catch (error) {
        this.stopChat();
        console.error(error);
      }
    },
    async clearChatRecord(roleid) { // 结束对话，清除聊天缓存
      try {
        const formData = new FormData();
        formData.append('agentid', roleid);
        formData.append('chatid', this.role_chatid[this.current_role]);
        const response = await axios.post('http://127.0.0.1:5000/end', formData,
          {
            headers: {
              // 'Content-Type': 'multipart/form-data'
              'Content-Type': 'application/json',
            },
          });
        console.log(response.data);

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
  background-image: url('../../public/images/waves/wave01.svg');
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
  background-color: #e1e6bb9b;
  margin: 0 10px;
}

.role_name {
  display: flex;
  justify-content: center;
  align-items: center;

  p {
    font-size: 30px;
    font-weight: bold;
    color: #6d4100;
  }

}

.role_img {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80%;
  padding-top: 20px;

  img {
    width: 80%;
    height: 100%;
    border-radius: 5px;
  }
}

.left-bottom {
  grid-area: 3 / 1 / 5 / 2;
  background-color: #e1e6bb9b;
  border-radius: 5px;
  margin: 10px;
}

.right {
  grid-area: 1 / 2 / 5 / 5;
  background-color: rgba(208, 182, 255, 0.749);
  margin: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ffffff;

}

.role_change_note {
  display: flex;
  text-align: center;
  width: 100%;

  p {
    width: 40%;
    margin: 2px auto;
    background-color: #efefefad;
    border-radius: 5px;
    color: rgb(54, 35, 0);
  }
}

.btn_contain {
  display: flex;
  justify-content: space-between;
  width: 300px;
  border-radius: 8px;
  flex-wrap: wrap;

  .change_role {
    width: 130px;
    height: 50px;
    margin: 8px 10px;
    text-align: center;
    line-height: 50px;
    border-radius: 8px;
    background-color: #ffbd80;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 20px;
    font-weight: bold;
    color: #6d4100;

  }

  .change_role:hover {
    background-color: #ff9900;
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

.loading_contain {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 160px;
  width: 100%;
}

/* 聊天部分: 结束 */
</style>