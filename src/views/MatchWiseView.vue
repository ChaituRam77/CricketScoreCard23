<template>
  <div class="container well">
    <div id="matchWiseDiv" >
    <button v-on:click="directToHome">&lt &lt Home</button>
    <button v-on:click="directToTeamWise">&lt Back</button>
    <h2 style="display: inline-block">
      {{ matchMessage(this.$route.params.matchId) }}
    </h2>
    </div>

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
        this.$router.push('/'+this.$route.params.teamId+'/home')
    },
    directToTeamWise(){
        this.$router.push('/'+this.$route.params.teamId+'/teamView/'+this.ownerId)
    },
    matchMessage(matchInfo){
      let matchData = matchInfo.split("_")
      return "Showing Match No "+matchData[0]+ " "+matchData[2]+" points"
    }
  },
};
</script>
<style>
#matchWiseDiv {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

#matchWiseDiv button {
  display: inline-block;
  margin-right: 20px;
  padding: 5px 15px;
  background-color: #0168d0;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
}

#matchWiseDiv h2 {
  display: inline-block;
  font-weight: bold;
  font-size: 16px;
}
</style>
