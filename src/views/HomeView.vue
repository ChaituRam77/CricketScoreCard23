import { computed } from '@vue/runtime-core'

<template>
  <div v-if="teamWiseTotalPoints.length == 0">
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <div
      class="spinner-border"
      style="width: 3rem; height: 3rem"
      role="status"
    ></div>
  </div>
  <div class="container well" v-else>
    <table class="table table-borderless table-sm table-hover" id="scoresTable">
      <thead>
        <tr class="bg-secondary bg-gradient text-white">
          <th scope="col">#</th>
          <th scope="col">Team</th>
          <th scope="col">
            {{ this.lastMatchInfo.teams }} (M{{ this.lastMatchInfo.matchNo }})
          </th>
          <!-- <th scope="col">{{ this.lastMatchInfo.teams }}</th> -->
          <th scope="col">Points</th>
        </tr>
      </thead>

      <tbody class="team" v-for="team in teamWiseTotalPoints" :key="team">
        <!-- <tr @click="dynamicHeading(team.name)"> -->
        <tr>
          <th scope="row">{{ team.no }} {{ team.rankChange }}</th>
          <td>
            <router-link name = "test" :to="teamLink(team.name)">
              {{ team.name }}
            </router-link>
          </td>
          <td>
            <p>{{ team.lastMatchPoints }}</p>
          </td>
          <td>
            <p>{{ team.totalPoints }}</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <br />
  <div
    class="container well"
    v-if="matchWisePoints.length == 0 && teamWiseTotalPoints.length == 0"
  ></div>
  <div
    class="container well"
    v-else-if="matchWisePoints.length == 0 && teamWiseTotalPoints.length > 0"
  >
    <h4><i>Click team name to view match-wise 👆</i></h4>
  </div>
  <div class="container well" v-else>
    <h4>{{ greeting }}</h4>
    <br />
    <table
      class="table table-borderless table-sm table-hover"
      id="matchWiseScoresTable"
    >
      <thead>
        <tr class="bg-primary bg-gradient text-white">
          <th scope="col">#</th>
          <th scope="col">Match</th>
          <th scope="col">Points</th>
        </tr>
      </thead>

      <tbody class="match" v-for="match in matchWisePoints" :key="match">
        <tr>
          <td>
            <p>{{ match.matchNo }}</p>
          </td>
          <td>
            <p>{{ match.matchVs }}</p>
          </td>
          <td>
            <p>{{ match.points }}</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import {
  getMatchWisePoints,
  fetchTeamWiseTotalPoints,
  getTeamWiseTotalPoints,
  getLastMatchInfo,
} from "../final-api-wrapper";

import { getFieldDataFromDoc, debugPoint } from "../firebase-config";

export default {
  data() {
    return {
      teamWiseTotalPoints: [],
      greeting: "",
      matchWisePoints: [],
      // lastMatchInfo: "Updating..."
      lastMatchInfo: {},
      team: null,
    };
  },
  mounted() {
    this.fetchScoresNew();
  },
  created() {
    this.team = this.$route.params.teamId;
    console.log("Team : " + this.team);
  },
  methods: {
    teamLink(teamNm){
    // console.log("team.name : "+teamNm)
    return '/teamView/' + this.$route.params.teamId +'/'+teamNm;

  },
    async fetchScores() {
      let totalPoints = await getTeamWiseTotalPoints(this.team, true);
      console.log("totalPoints : " + totalPoints);
      await fetchTeamWiseTotalPoints(this.team);
      this.teamWiseTotalPoints = totalPoints;
      this.lastMatchInfo = await getLastMatchInfo();

      console.log(this.lastMatchInfo);
    },
    async fetchScoresNew() {
      this.lastMatchInfo = await getLastMatchInfo();
      let totalPoints = await getFieldDataFromDoc(
        "AuctionTeams",
        this.team + "_Standings",
        this.lastMatchInfo.matchNo +
          "_" +
          this.lastMatchInfo.id +
          "_" +
          this.lastMatchInfo.teams
      );

      // debugPoint("sort check")

      totalPoints.sort(
        (a, b) => parseFloat(b.totalPoints) - parseFloat(a.totalPoints)
      );

      // debugPoint("totalPoints : " + JSON.stringify(totalPoints));
      // await fetchTeamWiseTotalPoints(this.team);
      this.teamWiseTotalPoints = totalPoints;

      // debugPoint(this.lastMatchInfo);
    },
    dynamicHeading(name) {
      this.greeting = `${name.toUpperCase()} team match-wise points`;
      this.updateMatchWisePoints(name);
    },
    updateMatchWisePoints(teamName) {
      let points = getMatchWisePoints(teamName);
      this.matchWisePoints = points;
    },
  },
};
</script>

<style>
div {
  margin-bottom: 10px;
}

.well {
  background: none;
}
</style>
