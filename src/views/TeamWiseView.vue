<template>
  <div class="container well">
    <!-- <h4>{{ this.$route.params.ownerId }} team match-wise points</h4> -->

    <button style="display: inline-block; margin-right: 50px" v-on:click="directToHome">Back</button>
    <h4 style="display: inline-block">
      {{ this.$route.params.ownerId }} team match-wise points
    </h4>

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
            <router-link :to="matchLink(match.matchId,match.matchVs)">
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
    matchLink(matchId,matchVs){
    // console.log("team.name : "+teamNm)
    return '/matchView/' + this.$route.params.teamId +'/'+this.ownerId +'/'+matchId+"_"+matchVs;

  },
    async updateMatchWisePoints() {
      let points = await fetchOwnerMatchWisePoints(this.ownerId);
      this.matchWisePoints = points;
      debugPoint("matchWisePoints");
      //   console.log(this.matchWisePoints);
    },
    directToHome(){
        this.$router.push('/home/'+this.$route.params.teamId)
    }
  },
};
</script>
