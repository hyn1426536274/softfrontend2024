<template>
  <div id="main">
    <div class="button_container">
      <div class="buttons">
        <router-link to="/chat" class="button"  id="btn1" >
          <div class="btn_img">
            <img src="../../public/images/icons/chat2.svg" alt="">
          </div>
          <div class="btn_text">
            问答聊天
          </div>
        </router-link>

        <router-link to="/oraltest" class="button"  id="btn2" >
          <div class="btn_img">
            <img src="../../public/images/icons/oral2.svg" alt="">
          </div>
          <div class="btn_text">
            口语测评
          </div>
        </router-link>

        <router-link to="/math" class="button"  id="btn3" >
          <div class="btn_img">
            <img src="../../public/images/icons/math.svg" alt="">
          </div>
          <div class="btn_text">
            算式批改
          </div>
        </router-link>

        <router-link to="/sentencecorrection" class="button"  id="btn4" >
          <div class="btn_img">
            <img src="../../public/images/icons/paper1.svg" alt="">
          </div>
          <div class="btn_text">
            病句修改
          </div>
        </router-link>

        <router-link to="/object" class="button"  id="btn5" >
          <div class="btn_img">
            <img src="../../public/images/icons/search2.svg" alt="">
          </div>
          <div class="btn_text">
            物体识别
          </div>
        </router-link>

        <router-link to="/roleplay" class="button"  id="btn6" >
          <div class="btn_img">
            <img src="../../public/images/icons/cos3.svg" alt="">
          </div>
          <div class="btn_text">
            角色模拟
          </div>
        </router-link>
        
      </div>
    </div>
  </div>
  
</template>

<script>
export default {

};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#main {
  text-align: center;
  height: 100vh;
}

.button_container {
  background-image: url('../../public/images/new_file1.svg');
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  width: 100%;

  .buttons {
    margin-top: 40px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;

    .button {
      margin: 2% 4%;

      width: 22%;
      height: calc(78vh / 2);
      background-color: #383838;
      color: white;
      font-size: 20px;
      cursor: pointer;
      border-radius: 10%;
      transition: background-color 0.3s;
      text-decoration: none;

      .btn_img {
        display: flex;
        width: 100%;
        height: 60%;
        margin-top: 15%;
        justify-content: center;

        img {
          height: 100%;
          width: 100%;
          object-fit: contain; 
        }
      }


      .btn_text {
        font-size: 24px;
        margin-top: 4%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    #btn1 {
      background-color: #30289c;
      box-shadow: 0 0 10px #30289c;
    }
    #btn1:hover {
      background-color: #473bb3;
      box-shadow: 0 0 10px #5f55bb;
    }
    #btn2 {
      background-color: #1b931d;
      box-shadow: 0 0 10px #2ea930;
    }
    #btn2:hover {
      background-color: #3ca930;
      box-shadow: 0 0 10px #5fbb55;
    }
    #btn3 {
      background-color: #d9b93b;
      box-shadow: 0 0 10px #d9ba3e;
    }
    #btn3:hover {
      background-color: #edca3b;
      box-shadow: 0 0 10px #edca3b;
    }
    #btn4 {
      background-color: #9c2839;
      box-shadow: 0 0 10px #9c2839;
    }
    #btn4:hover {
      background-color: #b52d3d;
      box-shadow: 0 0 10px #bb5559;
    }
    #btn5 {
      background-color: #9c6428;
      box-shadow: 0 0 10px #9c6428;
    }
    #btn5:hover {
      background-color: #b57a2d;
      box-shadow: 0 0 10px #bb9a55;
    }
    #btn6 {
      background-color: #56289c;
      box-shadow: 0 0 10px #56289c;
    }
    #btn6:hover {
      background-color: #5533b2;
      box-shadow: 0 0 10px #5b55bb;
    }
  }

}
</style>
