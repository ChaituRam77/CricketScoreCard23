<template>
  <div class="container well">
    <!-- <h4>{{ this.$route.params.ownerId }} team match-wise points</h4> -->
    <div id="teamWiseDiv" >
      <button v-on:click="directToHome">&lt Home</button>
      <h2>{{ this.$route.params.ownerId }}'s team match-wise points</h2>
    </div>
   <div><p> <i>Click on match points to view player-wise calculation 👆</i></p></div>
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
            <!-- <p>{{ match.matchNo }}</p> -->
            <router-link :to="matchLink(match.matchKey)">
              {{ match.matchNo }}
            </router-link>
          </td>
          <td>
            <!-- <p>{{ match.matchVs }}</p> -->
            <router-link :to="matchLink(match.matchKey)">
              {{ match.matchVs }}
            </router-link>
          </td>
          <td>
            <router-link :to="matchLink(match.matchKey)">
              {{ match.points }}
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { fetchOwnerMatchWisePoints } from "../final-api-wrapper";
import { debugPoint } from "../firebase-config";
export default {
  data() {
    return {
      matchWisePoints: [],
      ownerId: "",
    };
  },
  mounted() {
    this.ownerId = this.$route.params.ownerId;
    this.updateMatchWisePoints();
  },
  methods: {
    matchLink(matchKey){
    return '/'+this.$route.params.teamId+'/matchView' +'/'+this.ownerId +'/'+matchKey;
    // '/:teamId/matchView/:ownerId/:matchId'

  },
    async updateMatchWisePoints() {
      let points = await fetchOwnerMatchWisePoints(this.ownerId);
      points.sort(
        (a, b) => parseFloat(a.matchNo) - parseFloat(b.matchNo)
      );
      this.matchWisePoints = points;
      debugPoint("matchWisePoints");
    },
    directToHome(){
        this.$router.push('/'+this.$route.params.teamId+ '/home')
    }
  },
};
</script>
<style>
#teamWiseDiv {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

#teamWiseDiv button {
  display: inline-block;
  margin-right: 50px;
  padding: 5px 20px;
  background-color: #0168d0;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
}

#teamWiseDiv h2 {
  text-align: center;
  display: inline-block;
  font-weight: bold;
  font-size: 16px;
}
</style>
