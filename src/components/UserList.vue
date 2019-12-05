 <template>
    <div class="userEntry">
    <div class="menuOptions">
    <div>
    <button class="mm-button" v-on:click="resetAndReload" title="Liste aktualisieren"><font-awesome-icon :icon="['fas', 'sync']" /></button>
    <button class="mm-button" v-on:click="addAllUsers" :disabled="(userentries.length < 1) || !selectedRoom || !['owner', 'admin'].includes(selectedRoom.affiliation) || !isConnected" title="Alle hinzufügen"><font-awesome-icon :icon="['fas', 'user-plus']" /></button>
    <button class="mm-button" v-on:click="currentPage-=1" :disabled="currentPage < 2" title="Vorherige 500"><font-awesome-icon :icon="['fas', 'angle-double-left']" /></button>
    <button class="mm-button" v-on:click="currentPage+=1" :disabled="currentPage > last_page - 1" title="Nächste 500"><font-awesome-icon :icon="['fas', 'angle-double-right']" /></button><br><br>
    </div>
    <input class="filterUserInput" v-model="filterVal" v-on:change="filterUserResetPage" placeholder="Filtern nach Name / Dienststelle"/>
    </div>
    <div><hr></div>
    <div class="overflowDiv">
    <div class="userEntryDetail"
      v-for="user in userentries"
      v-bind:key="user.jid"
    >
      <div :title="user.jid">
      <button class="mm-button" :disabled="!selectedRoom || !['owner', 'admin'].includes(selectedRoom.affiliation) || !isConnected" v-on:click="addUser(user)" :title="'Anwender hinzufügen'"><font-awesome-icon :icon="['fas', 'plus-circle']" /></button>
      {{ user.sn+', '+user.givenName+' ('+user.extensionAttribute1+')' }}
    </div>
    </div>
    </div>
    <div class="title">Anwender ( maximal 500 angezeigt )</div>
    </div>
</template>
<script>
const LIMITENTRIES = 500
export default {
  name: 'userlist',
  data () {
    return {
      userentries: [],
      currentPage: 1,
      filterVal: '',
      last_page: 1,
    }
  },
  props: ['selectedRoom', 'isConnected', 'baseurl', 'apikey'],
  methods: {
    loadUserList: function () {
      let fetchUrl = this.baseurl + '?api_key=' + this.apikey + '&size=' + LIMITENTRIES + '&page=' + this.currentPage
      if (this.filterVal !== '') {
        fetchUrl += '&filterVal=' + this.filterVal
      }
      const loader = this.$loading.show()
      fetch(fetchUrl)
        .then(res => res.json())
        .then(json => {
          this.userentries = json.data
          this.last_page = json.last_page
        })
        .finally(() => loader.hide())
    },
    filterUserResetPage: function () {
      this.currentPage = 1
      this.loadUserList()
    },
    resetAndReload: function () {
      if (this.baseurl && this.apikey) {
        this.currentPage = 1
        this.filterVal = ''
        this.loadUserList()
      }
    },
    addUser: function (user) {
      this.$emit('addUsers', [user])
    },
    addAllUsers: function () {
      if (confirm('Wirklich alle Benutzer zu diesem Raum hinzufügen?')) {
        this.$emit('addUsers', this.userentries)
      }
    },
  },
  watch: {
    currentPage: function () {
      this.loadUserList()
    },
  },
  created: function () {
    this.resetAndReload()
  }
}
</script>
<style scoped>
.userEntry {
  font-size: 1.2vw;
  padding: 5px;
  text-align: left;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.userEntryDetail {
  font-size: 1.2vw;
  padding: 5px;
  text-align: left;
}
.filterUserInput{
  padding: 0.5vw;
  height: 1.25vw;
  font-size: 1vw;
  flex: 1;
}
.overflowDiv {
  background-color: white;
  flex: 1 1 0;
  overflow-y: auto;
}
</style>
