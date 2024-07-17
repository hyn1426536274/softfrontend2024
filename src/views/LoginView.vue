<template>
    <div class="main">
        <ul class="circles">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
    </ul>
    <div id="login-container"  class="board" v-show="showlogin">
        <div class="board_title">
            <h2>Link To Your Car</h2>
        </div>
        <div class="board_form">
            <form action="#" method="post">
                <div class="form-group">
                    <h3>车辆ID:</h3>
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <h3>密码:</h3>
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-button">
                    <button type="submit" @click="login">连接</button>
                    <button type="button" @click="changemode">修改密码</button>
                </div>
            </form>
        </div>
    </div>
    <div id="register-container" class="board" v-show="showrigister">
        <div class="board_title">
            <h2>Change Password</h2>
        </div>
        <div class="board_form">
            <form action="#" method="post">
                <div class="form-group">
                    <h3>车辆ID:</h3>
                    <label for="username">Car ID:</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <h3>密码:</h3>
                    <label for="password1">Password:</label>
                    <input type="password" id="password1" name="password1" required>
                </div>
                <div class="form-group">
                    <h3>新密码:</h3>
                    <label for="password2">Password:</label>
                    <input type="password" id="password2" name="password2" required>
                </div>
                <div class="form-group">
                    <h3>确认新密码:</h3>
                    <label for="password2">Password:</label>
                    <input type="password" id="password2" name="password2" required>
                </div>
                <div class="form-button">
                    <button type="submit">修改密码</button>
                    <button type="button" @click="changemode">连接</button>
                </div>
            </form>
        </div>
    </div>
    </div>
</template>
<script>
export default{
    name: 'LoginView',
    data() {
        return {
            showlogin: true,
            showrigister: false,
            login_success: false,

            car_id: '',
            password: ''
        }
    },
    methods: {
        login() {
            console.log('login')
            this.car_id = document.getElementById('username').value;
            this.password = document.getElementById('password').value;

            // 登录逻辑
            this.login_success = true;
            if (this.login_success) {
               this.toCamera();
            }
        },
        changemode() {
            this.showlogin = !this.showlogin;
            this.showrigister = !this.showlogin;
            console.log(this.showlogin)
        },
        toCamera() {
            this.$router.push({
                name: 'camera',
                query: {
                    is_login: this.login_success, 
                    car_id: this.car_id,
                },
            });
        }

    }
}

</script>


<style scoped>
@import url('https://fonts.googleapis.com/css?family=Exo:400,700');
*{
    margin: 0;
    padding: 0;
}
.main{
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Exo', sans-serif;

}
.board {
  width: 360px;
  margin: 10% auto;
  background-color: #f9f9f9;
  padding: 30px 60px;
  border-radius: 5px;
}

.board_title {
  text-align: center;
  margin-bottom: 20px;
}

.board_title h2 {
  color: #333;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group h3 {
  margin-bottom: 5px;
  font-size: 16px;
  color: #333;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-button {
  text-align: center;
}

button {
  padding: 10px 20px;
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

button:hover {
  background-color: #555;
}



.circles{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: -1;
    background-color: #fefeff;

    li{
    position: absolute;
    display: block;
    list-style: none;
    width: 20px;
    height: 20px;
    background: rgba(93, 166, 255, 0.2);
    animation: animate 25s linear infinite;
    bottom: -150px;
    }
    li:nth-child(1){
        left: 25%;
        width: 80px;
        height: 80px;
        animation-delay: 0s;
    }


    li:nth-child(2){
        left: 10%;
        width: 20px;
        height: 20px;
        animation-delay: 2s;
        animation-duration: 12s;
    }

    li:nth-child(3){
        left: 70%;
        width: 20px;
        height: 20px;
        animation-delay: 4s;
    }

    li:nth-child(4){
        left: 40%;
        width: 60px;
        height: 60px;
        animation-delay: 0s;
        animation-duration: 18s;
    }

    li:nth-child(5){
        left: 65%;
        width: 20px;
        height: 20px;
        animation-delay: 0s;
    }

    li:nth-child(6){
        left: 75%;
        width: 110px;
        height: 110px;
        animation-delay: 3s;
    }

    li:nth-child(7){
        left: 35%;
        width: 150px;
        height: 150px;
        animation-delay: 7s;
    }

    li:nth-child(8){
        left: 50%;
        width: 25px;
        height: 25px;
        animation-delay: 15s;
        animation-duration: 45s;
    }

    li:nth-child(9){
        left: 20%;
        width: 15px;
        height: 15px;
        animation-delay: 2s;
        animation-duration: 35s;
    }

    li:nth-child(10){
        left: 85%;
        width: 150px;
        height: 150px;
        animation-delay: 0s;
        animation-duration: 11s;
    }
}


@keyframes animate {
    0%{
        transform: translateY(0) rotate(0deg);
    }

    100%{
        transform: translateY(-1000px) rotate(720deg);
        opacity: 0;
        border-radius: 50%;
    }
}
</style>
