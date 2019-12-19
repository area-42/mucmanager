<template>
  <div v-if="appConfig" id="app">
    <v-dialog />
    <vue-progress-bar />
    <div class="login">
      <Login
        :bosh-service="appConfig.BOSH_SERVICE"
        :xmpp-domain="appConfig.XMPP_DOMAIN"
        @connStatusChanged="onConnStatusChanged"
      />
    </div>
    <div class="main">
      <div class="box">
        <UserList
          :baseurl="appConfig.BASEURL"
          :apikey="appConfig.APIKEY"
          :selected-room="selectedRoom"
          :is-connected="isConnected"
          @addUsers="onAddUsers"
        />
      </div>
      <div class="box">
        <RoomList
          :is-connected="isConnected"
          :muc-domain="appConfig.MUC_DOMAIN"
          :roomname-guideline="appConfig.ROOMNAME_GUIDELINE"
          :roomname-guideline-description="
            appConfig.ROOMNAME_GUIDELINE_DESCRIPTION
          "
          @selectRoom="onSelectRoom"
        />
      </div>
      <div class="box">
        <MemberList
          ref="memberlist"
          :selected-room="selectedRoom"
          :is-connected="isConnected"
          :xmpp-domain="appConfig.XMPP_DOMAIN"
          :xmpp-user="xmppUser"
        />
      </div>
    </div>
  </div>
</template>
<script>
import UserList from "./components/UserList";
import Login from "./components/Login";
import RoomList from "./components/RoomList";
import MemberList from "./components/MemberList";
export default {
  name: "App",
  components: {
    UserList,
    Login,
    RoomList,
    MemberList
  },
  data() {
    return {
      appConfig: null,
      selectedRoom: null,
      isConnected: false,
      xmppUser: null
    };
  },
  created() {
    fetch("./config/runtime.json")
      .then(res => res.json())
      .then(json => (this.appConfig = json));
  },

  methods: {
    onSelectRoom(room) {
      this.selectedRoom = room;
    },
    onConnStatusChanged(isConnected, xmppUser) {
      this.isConnected = isConnected;
      this.xmppUser = xmppUser;
    },
    onAddUsers(users) {
      this.$refs.memberlist.addMembers(users);
    }
  }
};
</script>
<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
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
  background: #210b61;
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
.mm-button {
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
.mm-button:disabled {
  color: grey;
  cursor: default;
}
</style>
