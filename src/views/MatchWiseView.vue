<template>
  <div class="container well">
    <button style="display: inline-block; margin-right: 50px" v-on:click="directToHome">Back</button>
    <button style="display: inline-block; margin-right: 50px" v-on:click="directToTeamWise">Back</button>
    <h4 style="display: inline-block">
      {{ this.$route.params.matchId }} points
    </h4>

    <br />
    <table
      class="table table-borderless table-sm table-hover"
      id="playerWiseScoresTable"
    >
      <thead>
        <tr class="bg-primary bg-gradient text-white">
          <th scope="col">Name</th>
          <th scope="col">Total</th>
          <th scope="col">Runs</th>
          <th scope="col">4's</th>
          <th scope="col">6's</th>
          <th scope="col">Wickets</th>
          <th scope="col">bowled/LBW</th>
          <th scope="col">hitwkt</th>
          <th scope="col">maiden</th>
          <th scope="col">runout</th>
          <th scope="col">directhit</th>
          <th scope="col">catch</th>
          <th scope="col">in11</th>
        </tr>
      </thead>

      <tbody class="player" v-for="player in playerWisePoints" :key="player">
        <tr>
          <td>
            <p>{{ player.name }}</p>
          </td>
          <td>
            <p>{{ player.total }}</p>
          </td>
          <td>
            <p>{{ player.runs }}</p>
          </td>
          <td>
            <p>{{ player.fours }}</p>
          </td>
          <td>
            <p>{{ player.sixes }}</p>
          </td>
          <td>
            <p>{{ player.wickets }}</p>
          </td>
          <td>
            <p>{{ player.bowledNlbw }}</p>
          </td>
          <td>
            <p>{{ player.hitwkt }}</p>
          </td>
          <td>
            <p>{{ player.maiden }}</p>
          </td>
          <td>
            <p>{{ player.runout }}</p>
          </td>
          <td>
            <p>{{ player.directhit }}</p>
          </td>
          <td>
            <p>{{ player.catch }}</p>
          </td>
          <td>
            <p>{{ player.in11 }}</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { fetchOwnerMatchPlayerWisePoints } from "../final-api-wrapper";
import { getDataFromDoc,debugPoint } from "../firebase-config";
export default {
  data() {
    return {
      playerWisePoints: [],
      ownerId: "",
      matchId:"",
      matchTotal : 0
    };
  },
  mounted() {
    this.matchId = this.$route.params.matchId;
    this.ownerId = this.$route.params.ownerId;
    this.updatePlayerWisePoints();
  },
  methods: {
    async updatePlayerWisePoints() {
      this.playerWisePoints = await fetchOwnerMatchPlayerWisePoints(this.ownerId,this.matchId);
    },
    directToHome(){
        this.$router.push('/home/'+this.$route.params.teamId)
    },
    directToTeamWise(){
        this.$router.push('/teamView/'+this.$route.params.teamId+'/'+this.ownerId)
    }
  },
};
</script>
