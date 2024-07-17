<template>
  <!-- <div class="size" style="position: absolute; width: 1024px; height: 600px; background-color: red;">
  </div> -->

  <div class="chat-container">
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="message in messages" :key="message" :class="message.type === 'user' ? 'user-message' : 'bot-message'">
        <p class="text" v-html="renderMarkdown(message.text)">
        </p>
      </div>
    </div>

    <div v-show="ChatStep===1" class="status_note">正在聆听……</div>
    <div v-show="ChatStep===2" class="status_note">正在转文字……</div>
    <div v-show="ChatStep===3" class="status_note">正在回答……</div>
    
    <div class="loading_contain">
      <div v-show="ChatStep===1" id="siri-container"></div>
      <LoadingAnimation v-show="ChatStep!=1" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
axios.defaults.withCredentials = true;
import SiriWave from "siriwave";
import { parse } from 'marked';
import LoadingAnimation from '@/components/LoadingAnimation.vue';

export default {
  components: {
    LoadingAnimation
  },
  data() {
    return {
      messages: [
        // { type: 'user', text: 'Hello' },
        // { type: 'bot', text: '## Hi, how can I help you?' },
        // { type: 'user', text: 'I want to know about your products' },
        // { type: 'bot', text: '**Sure**, ---  what do you want to know? --- ' },
        { type: 'bot', text: '你好，我是语音聊天机器人，你可以跟我对话哟' },
      ],
      siriwave: null,
      maxchat: 5,
      recordinterval: null,
      scrollinterval: null,
      audiopath: 'audio/audio.pcm',
      current_question: null,
      current_answer: null,
      ChatStep: 1, // 1:正在录音 2:录音结束 3:语音转文字 4:Spark对话
      chatEnabled: true, // 是否继续聊天(用于终止聊天循环)
    };
  },
  async mounted() {
    this.siriWave = new SiriWave({
      container: document.getElementById("siri-container"),
      width: 640,
      height: 200,
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
    this.stopChat();
    if (this.recordinterval) {
      clearInterval(this.recordinterval);
    }
    if (this.scrollinterval) {
      clearInterval(this.scrollinterval);
    }
  },
  methods: {
    renderMarkdown(text) {
      return parse(text);
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
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
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
    async sparkChat() {
      try {
        const formData = new FormData();
        formData.append('message', this.current_question);
        const response = await axios.post('http://127.0.0.1:8000/Spark对话', formData,
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

  } // methods
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-image: url('../../public/images/waves/wave04.svg');
  background-size: cover;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  padding-top: 50px;
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
  background-color: red;
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
    background-color: #d4f9b3;
  }
}

.bot-message {
  float: left;
  padding-right: 60%;
  text-align: left;

  p {
    background-color: #c4daf4;
  }

}
.status_note{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  font-size: 18px;
  font-weight: bold;
  background-color: rgba(227, 255, 255, 0.532);
}

.loading_contain{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 210px;
  width: 100%;
}
</style>
