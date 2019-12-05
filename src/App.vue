<template>
  <div id="app" v-if="appConfig">
    <div class="login">
    <Login :bosh_service="appConfig.BOSH_SERVICE" :xmpp_domain="appConfig.XMPP_DOMAIN" @connStatusChanged="onConnStatusChanged"/>
    </div>
    <div class="main">
      <div class="box">
      <UserList @addUsers="onAddUsers" :baseurl="appConfig.BASEURL" :apikey="appConfig.APIKEY" :selectedRoom="selectedRoom" :isConnected="isConnected"/>
      </div>
      <div class="box">
      <RoomList @selectRoom="onSelectRoom" :isConnected="isConnected" :muc_domain="appConfig.MUC_DOMAIN" :roomname_guideline="appConfig.ROOMNAME_GUIDELINE" :roomname_guideline_description="appConfig.ROOMNAME_GUIDELINE_DESCRIPTION"/>
      </div>
      <div class="box">
      <MemberList ref="memberlist" :selectedRoom="selectedRoom" :isConnected="isConnected"/>
      </div>
    </div>
  </div>
</template>
<script>
import UserList from './components/UserList'
import Login from './components/Login'
import RoomList from './components/RoomList'
import MemberList from './components/MemberList'
export default {
  name: 'App',
  data () {
    return {
      appConfig: null,
      selectedRoom: null,
      isConnected: false
    }
  },
  components: {
    UserList,
    Login,
    RoomList,
    MemberList,
  },

  methods: {
    onSelectRoom: function (room) {
      this.selectedRoom = room
    },
    onConnStatusChanged: function (isConnected) {
      this.isConnected = isConnected
    },
    onAddUsers: function (users) {
      this.$refs.memberlist.addMembers(users)
    }
  },
  created: function () {
    fetch('./config/runtime.json')
      .then(res => res.json())
      .then(json => this.appConfig = json)
  },
}
</script>
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
}
body {
  font-size: 10px;
  font-size: 1.3vw;
 }
.main {
  display: flex;
  flex: 1;
  min-height: 0;
 }
 .login {
  margin-top: 5px;
 }
.box {
 padding: 5px;
 background: #210B61;
 margin: 5px;
 display: flex;
 flex: 1;
 min-height: 0;
 flex-direction: column;
 width: 0;
}
*:focus {
    outline: none;
}
.title {
  font-size: 1.6vw;
  color: lightblue;
  text-align: center;
  margin-top: 10px;
}
.menuOptions {
  height: 6vw;
  display: flex;
  flex-direction: column;
}
.mm-button{
  font-size: 1.6vw;
  color: rgb(88, 170, 197);
  background: none;
  cursor: pointer;
  border: none;
  margin: 0;
  padding-top: 0;
  padding-right: 5px;
  padding-bottom: 0;
  padding-left: 0;
}
.mm-button:disabled{
  color: grey;
  cursor: default;
}
</style>
