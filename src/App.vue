<script>
import UserList from "./components/UserList";
import RoomList from "./components/RoomList";
import MemberList from "./components/MemberList";
import QrcodeModal from "./components/QrcodeModal";
import { doXmppLogin, xmppStatus } from "./xmpp_utils.js";
export default {
  name: "App",
  components: {
    UserList,
    RoomList,
    MemberList,
    QrcodeModal,
  },
  data() {
    return {
      appConfig: null,
      selectedRoom: null,
      isConnected: false,
      xmppUser: null,
    };
  },
  created() {
    fetch("./config/runtime.json")
      .then((res) => res.json())
      .then((json) => (this.appConfig = json))
      .then(() => fetch(this.appConfig.CREDENTIALS_URL))
      .then((res) => res.json())
      .then((json) => this.doLogin(json.jid.split("@")[0], json.password));
  },

  methods: {
    onSelectRoom(room) {
      this.selectedRoom = room;
    },
    onAddUsers(users) {
      this.$refs.memberlist.addMembers(users);
    },
    doLogin(xmppUser, xmppPass) {
      doXmppLogin(
        xmppUser,
        xmppPass,
        this.appConfig.BOSH_SERVICE,
        this.appConfig.XMPP_DOMAIN,
        this.onConnect,
        window.location.hash === "#debug"
      );
    },
    onConnect(status) {
      this.isConnected = status === xmppStatus.CONNECTED;
      this.xmppUser = status === xmppStatus.CONNECTED ? this.xmppUser : null;
      this.connStatus = status;
      if (status === xmppStatus.CONNFAIL) {
        alert("Login fehlgeschlagen");
      } else if (status === xmppStatus.AUTHFAIL) {
        alert("Falsche Nutzer/Passwortkombination");
      }
      if (
        [
          xmppStatus.CONNECTING,
          xmppStatus.AUTHENTICATING,
          xmppStatus.DISCONNECTING,
        ].includes(status)
      ) {
        this.loader = this.$loading.show();
      } else {
        this.loader.hide();
      }
    },
  },
};
</script>

<template>
  <div v-if="appConfig" id="app">
    <v-dialog />
    <vue-progress-bar />
    <QrcodeModal />
    <div class="main">
      <div class="box">
        <UserList
          :baseurl="appConfig.BASEURL"
          :selected-room="selectedRoom"
          :is-connected="isConnected"
          @addUsers="onAddUsers"
        />
      </div>
      <div class="box">
        <RoomList
          :is-connected="isConnected"
          :members-only-admins="appConfig.MEMBERSONLY_ADMINS"
          :muc-domain="appConfig.MUC_DOMAIN"
          :roomname-guideline="appConfig.ROOMNAME_GUIDELINE"
          :roomname-guideline-description="
            appConfig.ROOMNAME_GUIDELINE_DESCRIPTION
          "
          :xmpp-domain="appConfig.XMPP_DOMAIN"
          :xmpp-user="xmppUser"
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
