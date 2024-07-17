<template>
  <nav>
    <router-link to="/" class="logo">CarController</router-link>
    <span></span>
    <div class="nav_right">
      <router-link to="/login" class="login" v-if="!userParams">
      登录
      </router-link>
      <router-link to="/login" class="login" v-if="userParams">
      {{ userParams.username }}
      </router-link>
    </div>
  </nav>
  <router-view/>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      userParams:null,
    }
  },
  created() {
    this.userParams = {
      username: '登录',
    }
  }
} 

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
  color: #000000;
  height: 100vh;
  min-height: 500px;
}

nav {
  position: fixed;
  display: flex;
  justify-content: space-between;
  width: 100%;
  top : 0;
  height: 7%;
  min-height: 50px;
  padding: 16px;
  background-color: #112d4e;
  z-index: 999;
  a {
  font-weight: bold;
  color: #ffffff;
  text-decoration: none;
  height: 100%;
  transition: all 0.3s ease-in-out;
  }
  a:hover{
    color: #FFCC42;
  }
  span{
    color: #ffffff;
  }
  .nav_right{
    height: 100%;
    display: flex;
    align-items: center;
    .avatar{
      margin-right: 20px;
    }
    .login{
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}

nav a.router-link-exact-active {
  color: #ffffff;
}
</style>
