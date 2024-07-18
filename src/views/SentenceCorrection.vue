<template>
  <div class="title">
    <p>句子批改</p>
  </div>
  <div id="main">
    <div class="left-top">
      <!-- <div class="no_img_preview" v-show="!previewImage"></div> -->
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
      <div class="result_container" v-if="detection_result">
        <p>检测结果:</p>
        <div class="result_msg" v-if="detection_result">
          <p>状态: &nbsp;<el-tag type="primary">成功检测</el-tag></p>
          <p>是否真实: &nbsp;
            <el-tag type="success" v-if="detect_result === true">真实</el-tag>
            <el-tag type="danger" v-if="detect_result === false">伪造</el-tag>
          </p>
          <!-- <p>检测方法: {{ detection_result.method }}</p> -->
          <!-- <p>使用模型: &nbsp;<el-tag type="info">{{ detection_result.mlmodel }}</el-tag></p> -->
        </div>
      </div>
    </div>

    <div class="left-bottom">
      <div class="btn_contain">
      <div class="take_photo" @click="shootcutdown">
        <div>
          <img src="../../public/images/icons/camera01.svg" alt="Camera">
        </div>
        <p v-show="!is_shooted">文字识别</p>
        <p v-show="is_shooted">再来一张</p>
      </div>
      <!--  v-show="is_shooted" -->
      <div class="ai_correct" @click="ai_sentence_correction">
        <div>
          <img src="../../public/images/icons/correct01.svg" alt="Camera">
        </div>
        <p>AI批改</p>
      </div>
    </div>
    </div>
    <div class="right-top">
      <div class="grid_title">
        <p>识别结果</p>
      </div>
      <div class="text_contain">
        {{ recognition_result }}
      </div>
    </div>
    <div class="right-bottom">
      <div class="grid_title">
        <p>修正结果</p>
      </div>
      <div class="text_contain">
        {{ correction_result }}
      </div>
    </div>



  </div>

</template>
<script>
import axios from 'axios';
axios.defaults.withCredentials = true;

// import { formatFileSize } from '@/utils.js';

export default {
  name: 'SingleImage',
  data() {
    return {
      previewImage: null,
      filename: null,
      filesize: null,
      detection_result: null,
      imgfile: null,
      if_traced: false,
      traced_camare_id: "515adw31daw351",
      detect_result: null,

      devices: [],
      wrapper: [],
      videoEl: [],
      cameras: [],
      selectedCameraId: null,
      is_shooted: false,

      temp_path: 'ocr/temp.jpg',

      recognition_result: '无', // 识别结果
      correction_result: '无', // 批改结果
    };
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
            width: 500,
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

          // 文字识别
          await this.characterRecognition();
          console.log('characterRecognition done');
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

    async characterRecognition() {
      if (!this.imgfile) {
        alert('请上传图像');
        return;
      }
      const formData = new FormData();
      formData.append('image_base64', this.imgfile);
      formData.append('image_path', this.temp_path);

      const formData2 = new FormData();
      formData2.append('image_path', this.temp_path);
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

        const text_response = await axios.post('http://127.0.0.1:8000/文字扫描', formData2,
          {
            headers: {
              // 'Content-Type': 'multipart/form-data'
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );
        console.log('text_response:', text_response.data);
        this.recognition_result = '';
        for(let i = 0; i < text_response.data.result.length; i++){ // 分行显示
            this.recognition_result += (text_response.data.result[i]+" ");
        }
        

      } catch (error) {
        console.error('Error:', error);
      }
    },
    async ai_sentence_correction() {
      const formData = new FormData();
      formData.append('text', this.recognition_result);
      try {
        const response = await axios.post('http://127.0.0.1:8000/语文文本批改', formData,
          {
            headers: {
              // 'Content-Type': 'multipart/form-data'
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );
        console.log('correst_response:', response.data);
        
        if(!response.data.result){
          this.correction_result = "无修正结果";
        }
        else{
          // const len = response.data.result.length;
          this.correction_result = response.data.result.slice(16);
        }
      }
      catch (error) {
        console.error('Error:', error);
      }
    }
  } // methods
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
  background-image: url('../../public/images/waves/wave06.svg');
  background-size: cover;
  display: grid;
  padding-top: 80px;
  height: 100vh;
  grid-template-columns: 1fr 1fr;
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

.right-top {
  grid-area: 1 / 2 / 2 / 3;
  background-color: rgba(182, 218, 255, 0.749);
  margin: 0 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ffffff;

  .text_contain {
  flex: 1;
  background-color: #fff;
  border-radius: 5px;
  height: 200px;
  margin-top: 10px;
  padding: 10px;
  overflow-y: auto;
  }
}

.right-bottom {
  grid-area: 2 / 2 / 5 / 3;
  background-color: rgba(174, 248, 222, 0.749);
  margin: 0 10px 10px 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ffffff;

  .text_contain {
  flex: 1;
  background-color: #fff;
  border-radius: 5px;
  height: 190px;
  margin-top: 10px;
  padding: 10px;
  overflow-y: auto;
  }
}

.btn_contain {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  border-radius: 8px;


  .take_photo,
  .ai_correct {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 40%;
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
    background-color: #5092e3;

    p {
      color: #000000;
    }
  }

  .ai_correct {
    background-color: #51e759;

    p {
      color: #000000;
    }
  }

  .take_photo:hover {
    background-color: #4279bc;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  }

  .ai_correct:hover {
    background-color: #49c540;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  }
}



.video_preview {
  width: 500px;
  height: 300px;
  margin: 2rem 0;
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
  width: 500px;
  height: 300px;
  margin: 2rem 0;
  display: inline-block;
  position: relative;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.no_img_preview {
  width: 30%;
  min-height: 300px;
  margin: 2rem 0;
  border: 2px dashed #072F5D;
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
</style>