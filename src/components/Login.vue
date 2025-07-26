<script>
import { doXmppLogin, doXmppLogout, xmppStatus } from "../xmpp_utils.js";
export default {
  name: "Login",
  props: {
    boshService: { type: String, default: null },
    xmppDomain: { type: String, default: null },
  },
  data() {
    return {
      xmppUser: "",
      xmppPass: "",
      isConnected: false,
      showLogin: true,
    };
  },
  methods: {
    doLogin() {
      this.xmppUser = this.xmppUser.toLowerCase();
      doXmppLogin(
        this.xmppUser,
        this.xmppPass,
        this.boshService,
        this.xmppDomain,
        this.onConnect,
        window.location.hash === "#debug"
      );
    },
    doLogout() {
      doXmppLogout();
    },
    onConnect(status) {
      this.isConnected = status === xmppStatus.CONNECTED;
      const xmppUser = status === xmppStatus.CONNECTED ? this.xmppUser : null;
      const xmppPass = status === xmppStatus.CONNECTED ? this.xmppPass : null;
      this.$emit("connStatusChanged", this.isConnected, xmppUser, xmppPass);
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
  <div>
    <div v-if="showLogin" class="loginDiv">
      <span>Bitte anmelden</span>
      <input v-model="xmppUser" class="loginInput" placeholder="vorname.name" />
      <input
        v-model="xmppPass"
        class="loginInput"
        placeholder="Kennwort"
        type="password"
        @keyup.enter="doLogin"
      />
      <button
        v-if="isConnected"
        class="mm-button"
        title="Logout"
        @click="doLogout"
      >
        <font-awesome-icon :icon="['fas', 'sign-out-alt']" />
      </button>
      <button v-else class="mm-button" title="Login" @click="doLogin">
        <font-awesome-icon :icon="['fas', 'sign-in-alt']" />
      </button>
    </div>
    <span>
      <button
        v-if="showLogin"
        class="mm-button"
        title="Ausblenden"
        @click="showLogin = false"
      >
        <font-awesome-icon :icon="['fas', 'angle-double-up']" />
      </button>
      <button
        v-else
        class="mm-button"
        title="Einblenden"
        @click="showLogin = true"
      >
        <font-awesome-icon :icon="['fas', 'angle-double-down']" />
      </button>
    </span>
    <div class="titleApp">MucManager</div>
  </div>
</template>

<style scoped>
.loginInput {
  padding: 5px;
  margin-left: 8px;
  margin-right: 8px;
  width: 20%;
  height: 1.2vw;
  vertical-align: top;
  font-size: 1.2vw;
  color: rgb(88, 170, 197);
}
.loginDiv {
  width: 100%;
  text-align: center;
  height: 3vh;
}
.titleApp {
  font-size: 2vw;
  color: #210b61;
  text-align: center;
  padding-top: 5px;
  padding-bottom: 20px;
}
</style>
