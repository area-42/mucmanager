<template>
  <div class="userEntry">
    <div class="menuOptions">
      <div>
        <button
          class="mm-button"
          title="Liste aktualisieren"
          @click="resetAndReload"
        >
          <font-awesome-icon :icon="['fas', 'sync']" />
        </button>
        <button
          class="mm-button"
          :disabled="
            userentries.length < 1 ||
              !selectedRoom ||
              !['owner', 'admin'].includes(selectedRoom.affiliation) ||
              !isConnected
          "
          title="Alle hinzufügen"
          @click="addAllUsers"
        >
          <font-awesome-icon :icon="['fas', 'user-plus']" />
        </button>
        <button
          class="mm-button"
          :disabled="currentPage < 2"
          title="Vorherige 500"
          @click="currentPage -= 1"
        >
          <font-awesome-icon :icon="['fas', 'angle-double-left']" />
        </button>
        <button
          class="mm-button"
          :disabled="currentPage > lastPage - 1"
          title="Nächste 500"
          @click="currentPage += 1"
        >
          <font-awesome-icon :icon="['fas', 'angle-double-right']" />
        </button><br><br>
      </div>
      <input
        v-model="filterVal"
        class="filterUserInput"
        placeholder="Filtern nach Name / Dienststelle"
        @change="filterUserResetPage"
      >
    </div>
    <div>
      <hr>
    </div>
    <div class="overflowDiv">
      <div
        v-for="user in userentries"
        :key="user.jid"
        class="userEntryDetail"
      >
        <div :title="user.jid">
          <button
            class="mm-button"
            :disabled="
              !selectedRoom ||
                !['owner', 'admin'].includes(selectedRoom.affiliation) ||
                !isConnected
            "
            :title="'Anwender hinzufügen'"
            @click="addUser(user)"
          >
            <font-awesome-icon :icon="['fas', 'plus-circle']" />
          </button>
          {{
            user.sn +
              ", " +
              user.givenName +
              " (" +
              user.extensionAttribute1 +
              ")"
          }}
        </div>
      </div>
    </div>
    <div class="title">
      Anwender ( maximal 500 angezeigt )
    </div>
  </div>
</template>
<script>
const LIMITENTRIES = 500;
export default {
  name: "Userlist",
  props: {
    selectedRoom: { type: Object, default: null },
    isConnected: { type: Boolean },
    baseurl: { type: String, default: null },
    apikey: { type: String, default: null }
  },
  data() {
    return {
      userentries: [],
      currentPage: 1,
      filterVal: "",
      lastPage: 1
    };
  },
  watch: {
    currentPage() {
      this.loadUserList();
    }
  },
  created() {
    this.resetAndReload();
  },
  methods: {
    loadUserList() {
      let fetchUrl = `${this.baseurl}?api_key=${this.apikey}&size=${LIMITENTRIES}&page=${this.currentPage}`;
      if (this.filterVal !== "") {
        fetchUrl += `&filterVal=${this.filterVal}`;
      }
      const loader = this.$loading.show();
      fetch(fetchUrl)
        .then(res => res.json())
        .then(json => {
          this.userentries = json.data;
          this.lastPage = json.last_page;
        })
        .finally(() => {
          this.userentries.map(entry => (entry.jid = entry.jid.toLowerCase()));
          loader.hide();
        });
    },
    filterUserResetPage() {
      this.currentPage = 1;
      this.loadUserList();
    },
    resetAndReload() {
      if (this.baseurl && this.apikey) {
        this.currentPage = 1;
        this.filterVal = "";
        this.loadUserList();
      }
    },
    addUser(user) {
      this.$emit("addUsers", [user]);
    },
    addAllUsers() {
      if (confirm("Wirklich alle Benutzer zu diesem Raum hinzufügen?")) {
        this.$emit("addUsers", this.userentries);
      }
    }
  }
};
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
.filterUserInput {
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
