 <template>
  <div>
    <div v-if="showLogin" class="loginDiv">
    <span>Bitte anmelden</span>
    <input v-model="xmppUser" class="loginInput" placeholder="vorname.name">
    <input v-model="xmppPass" class="loginInput" placeholder="Kennwort" type="password" v-on:keyup.enter="doLogin"/>
    <button class="mm-button" v-if="isConnected" v-on:click="doLogout" title="Logout"><font-awesome-icon :icon="['fas', 'sign-out-alt']" /></button>
    <button class="mm-button" v-else v-on:click="doLogin" title="Login"><font-awesome-icon :icon="['fas', 'sign-in-alt']" /></button>
    </div>
    <span>
      <button v-if="showLogin" class="mm-button" v-on:click="showLogin=false" title="Ausblenden" ><font-awesome-icon :icon="['fas', 'angle-double-up']" /></button>
      <button v-else class="mm-button" v-on:click="showLogin=true" title="Ausblenden" ><font-awesome-icon :icon="['fas', 'angle-double-down']" /></button>
    </span>
    <div class="titleApp">MucManager</div>
  </div>
</template>
<script>
import { doXmppLogin, doXmppLogout, xmppStatus } from '../xmpp_utils.js'
export default {
  name: 'login',
  data () {
    return {
      xmppUser: '',
      xmppPass: '',
      isConnected: false,
      showLogin: true,
    }
  },
  props: ['bosh_service', 'xmpp_domain'],
  methods: {
    doLogin: function () {
      doXmppLogin(this.xmppUser, this.xmppPass, this.bosh_service,
        this.xmpp_domain, this.onConnect)
    },
    doLogout: function () {
      doXmppLogout()
    },
    onConnect: function (status) {
      this.isConnected = status === xmppStatus.CONNECTED
      this.$emit('connStatusChanged', this.isConnected)
      this.connStatus = status
      if (status === xmppStatus.CONNFAIL) {
        alert('Login fehlgeschlagen')
      } else if (status === xmppStatus.AUTHFAIL) {
        alert('Falsche Nutzer/Passwortkombination')
      }
      if ([xmppStatus.CONNECTING, xmppStatus.AUTHENTICATING,xmppStatus.DISCONNECTING].includes(status)) {
        this.loader = this.$loading.show()
      } else {
        this.loader.hide()
      }
    },
  },
}
</script>
<style scoped>
.loginInput{
  padding: 5px;
  margin-left: 8px;
  margin-right: 8px;
  width: 20%;
  height: 1.2vw;
  vertical-align: top;
  font-size: 1.2vw;
  color: rgb(88, 170, 197);
}
.loginDiv{
  width: 100%;
  text-align: center;
  height: 3vh;
}
.titleApp {
  font-size: 2vw;
  color: #210B61;
  text-align: center;
  padding-top: 5px;
  padding-bottom: 20px;
}
</style>
