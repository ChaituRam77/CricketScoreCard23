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
          <th scope="col">{{ this.lastMatchInfo.teams }} (M{{ this.lastMatchInfo.matchNo }})</th>
          <!-- <th scope="col">{{ this.lastMatchInfo.teams }}</th> -->
          <th scope="col">Points</th>
        </tr>
      </thead>

      <tbody class="team" v-for="team in teamWiseTotalPoints" :key="team">
        <tr @click="dynamicHeading(team.name)">
          <th scope="row">{{ team.no }}</th>
          <td>
            <p>{{ team.name }}</p>
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
  getLastMatchInfo
} from "../final-api-wrapper";

export default {
  data() {
    return {
      teamWiseTotalPoints: [],
      greeting: "",
      matchWisePoints: [],
      // lastMatchInfo: "Updating..."
      lastMatchInfo: {}
    };
  },
  mounted() {
    this.fetchScores();
  },
  methods: {
    async fetchScores() {
      let totalPoints = await getTeamWiseTotalPoints();
      console.log(totalPoints)
      await fetchTeamWiseTotalPoints();
      this.teamWiseTotalPoints = totalPoints;
      this.lastMatchInfo = await getLastMatchInfo();
      console.log(this.lastMatchInfo)
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
