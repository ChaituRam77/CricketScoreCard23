<template>
  <div id="app">
    <select v-model="selectedOwner" class="dropdown" @change="getOwnersTeam">
      <option selected>Select owner</option>
      <option v-for="owner in teamOwners" :key="owner">{{ owner }}</option>
    </select>
  </div>
  <div class="table-container" v-if="selectedOwner">
    <div class="container well">
    <h4><i>Showing {{ selectedOwner }}'s auction team</i></h4>
  </div>
    <table
      class="table table-borderless table-sm table-hover"
      id="ownersTeamTable" v-if="selectedOwner"
    >
      <thead>
        <tr class="bg-primary bg-gradient text-white">
          <th scope="col">#</th>
          <th scope="col">Name</th>
          <th scope="col">Category</th>
          <th scope="col">Team</th>
          <th scope="col">AuctionPrice</th>
        </tr>
      </thead>

      <tbody class="player" v-for="player in ownerTeamArr" :key="player">
        <tr>
          <td>
            <p>{{ ownerTeamArr.indexOf(player) +1 }}</p>
          </td>
          <td>
            <p>{{ player.name }}</p>
          </td>
          <td>
            <p>{{ player.category }}</p>
          </td>
          <td>
            <p>{{ player.team }}</p>
          </td>
          <td>
            <p>{{ player.auctionPrice }}</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { getOwnersOfTeam, getTeamOfSelectedOwner } from "../final-api-wrapper";
import { debugPoint } from "../firebase-config";
export default {
  data() {
    return {
      teamOwners: [],
      selectedOwner: null,
      ownerTeamArr:  [],
      no : 0,
    };
  },

  created() {
    let team = this.$route.params.teamId;
    if (team == "auction") {
      this.team = "TeamA";
    }
    if (team == "scores") {
      this.team = "TeamB";
    }
    console.log("Created Team : " + this.team);
    this.getTeam();
  },
  methods: {
    getTeam() {
      this.teamOwners = getOwnersOfTeam(this.team);
      // debugPoint("this.ownersTeam : " + this.ownersTeam);
    },
    ownerText(owner){
      return "showing" + owner + "'s team'"
    },
    getOwnersTeam() {
      debugPoint("getOwnersTeam");
      // getTeamOfSelectedOwner(this.team, this.ownersTeam);
      let obj = null;
      if (this.team == "TeamA") {
        obj = require("../data/ownersTeamA.json");
      }
      if (this.team == "TeamB") {
        obj = require("../data/ownersTeamB.json");
      }

      // const map = new Map();
      for (const key in obj) {
        if (this.selectedOwner == key) {
          // map.set(key, obj[key]);
          this.ownerTeamArr = obj[key]
          break;
        }
      }
      debugPoint(this.ownerTeamArr[0].name)
    },
  },
};
</script>

<style>
.dropdown {
  font-size: 16px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 200px;
}

.dropdown option {
  background-color: #ffffff;
  color: #333333;
}

#app {
  margin-bottom: 30px;
}
</style>
