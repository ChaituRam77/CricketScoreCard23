<template>
  <div class="btn-group">
    <div class="dropdown">
        Select Option
      <ul class="dropdown-menu">
        <li><a class="dropdown-item">Show Team</a></li>
      </ul>
    </div>
    <div class="dropdown">
    <button
      class="btn btn-secondary dropdown"
      type="button" id="dropdownMenuButton1"
      data-bs-toggle="dropdown"
      aria-expanded="false">
      {{ selectedOwner || 'Select owner' }}
    </button>
    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1" role="menu">
      <li v-for="owner in ownersTeam" :key="owner">
        <a class="dropdown-item" @click="onOwnerSelect(owner)">{{owner}}</a>
      </li>
    </ul>
  </div>
  </div>
</template>
<script>
import { getOwnersOfTeam } from "../final-api-wrapper";
import {
  debugPoint,
} from "../firebase-config";
export default {
  data() {
    return {
      ownersTeam : [],
      // ownersTeam: ['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8', 'team9', 'team10'],
      options: ['A', 'B', 'C'],
      selectedOwner : null
    };
  },
  // mounted() {
  //   this.team = this.$route.params.teamId;
  //   console.log("Mounted Team : " + this.team);
  //   this.getTeam();
  // },
  created() {
    this.team = this.$route.params.teamId;
    console.log("Created Team : " + this.team);
    this.getTeam();
  },
  methods: {
    getTeam() {
      this.ownersTeam = getOwnersOfTeam(this.team)
      debugPoint("this.ownersTeam : "+this.ownersTeam)
    },
    onOwnerSelect(owner) {
      this.selectedOwner = owner;
      debugPoint("this.selectedOwner : "+this.selectedOwner)
    }
  },
};
</script>

<style>
.dropdown {
  margin-left: 16px;
  margin-right: 16px;
  padding: 20px 0px;
  left: auto; 
}
</style>
