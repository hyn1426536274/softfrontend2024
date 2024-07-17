<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-content">
        <router-link  to="/" id="home_btn">
          <img src="../public/images/icons/home.svg" alt="home" />
        </router-link>
        <div class="time">{{ currentTime }}</div>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>
<script>
// import HomeView from './views/HomeView.vue'

export default {
  data() {
    return {
      currentTime: ''
    };
  },
  created() {
    this.updateTime();
    setInterval(this.updateTime, 1000);
  },
  methods: {
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString();
    }
  }
};

</script>

<style>
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.navbar {
  position: absolute;
  width: 100%;
  padding: 10px 0;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  margin: 0 auto;
  #home_btn {
    height: 30px;
    img {
      height: 100%;
    }
  }
}

.time {
  padding: 5px 10px;
  font-size: 22px;
  border-radius: 5px;
}

</style>
