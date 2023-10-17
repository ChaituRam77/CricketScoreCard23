import { computed } from '@vue/runtime-core'

<template>
  <div id="matchDiv">
    <select
      id="matchDropDown"
      v-model="showScoreCardOfMatch"
      @change="getScoreCardOfMatch"
      style="text-align: center; font-weight: bold"
    >
      <option v-for="match in matchDetailsArr" :value="match">
        {{ match }}
      </option>
    </select>
  </div>
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
          <th scope="col"> </th>
          <th scope="col">#</th>
          <th scope="col">Team</th>
          <th scope="col">Match Points</th>
          <th scope="col">Overall Points</th>
        </tr>
      </thead>

      <tbody class="team" v-for="team in teamWiseTotalPoints" :key="team">
        <tr>
          <!-- <th scope="row">{{ team.no }} {{ team.rankChange }}</th> -->
          <!-- <td>
            <img
              v-if="team.rankChange.includes('⬆')"
              :src="imgChevronUp"
              alt="up arrow icon"
            />
            <img
              v-else-if="team.rankChange.includes('⬇')"
              :src="imgChevronDwn"
              alt="down arrow icon"
            />            
            <span style="font-size: 80%">
              {{ team.rankChange.replace('⬆','').replace('⬇','').replace('➖','')}}
            </span>

          </td> -->
          <td>
  <div style="display: flex; align-items: center;">
    <img
      v-if="team.rankChange.includes('⬆')"
      :src="imgChevronUp"
      alt="up arrow icon"
    />
    <img
      v-else-if="team.rankChange.includes('⬇')"
      :src="imgChevronDwn"
      alt="down arrow icon"
    />
    <span style="font-size: 80%">
      {{ team.rankChange.replace('⬆','').replace('⬇','').replace('➖','')}}
    </span>
  </div>
</td>
          <td>
            <!-- {{ team.no }} -->
            <router-link :to="teamLink(team.name)">
              <a>{{ team.no }}</a>
            </router-link>
          </td>
          <td>
            <router-link :to="teamLink(team.name)">
              <a>{{ team.name }}</a>
            </router-link>
          </td>
          <td>
            <!-- <p>{{ team.lastMatchPoints }}</p> -->
            <router-link :to="teamLink(team.name)">
              <a>{{ team.lastMatchPoints }}</a>
            </router-link>
          </td>
          <td>
            <!-- <p>{{ team.totalPoints }}</p> -->
            <router-link :to="teamLink(team.name)">
              <a>{{ team.totalPoints }}</a>
            </router-link>
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
    <h4><i>Click on team name to view match-wise points 👆</i></h4>
  </div>
</template>

<script>
import {
  getMatchWisePoints,
} from "../final-api-wrapper";

import {
  getFieldDataFromDoc,
  getDocNmsFromColl,
  debugPoint,
} from "../firebase-config";

export default {
  data() {
    return {
      imgChevronUp: require('../images/chevron-up.svg'),
      imgChevronDwn: require('../images/chevron-down.svg'),
      apiScoreCardCollection: "ApiScoreCardNew",
      teamWiseTotalPoints: [],
      greeting: "",
      matchWisePoints: [],
      // lastMatchInfo: "Updating..."
      lastMatchInfo: {},
      team: null,
      matchDetailsArr: [],
      allMatchDetailsArr: [],
      showScoreCardOfMatch: "recentMatch",
    };
  },
  mounted() {
    this.mountMeethods();
  },
  created() {
    let team = this.$route.params.teamId;
    if (team == "auction") {
      this.team = "TeamA";
    }
    if (team == "scores") {
      this.team = "TeamB";
    }
    console.log("Team : " + this.team);
  },
  methods: {
    async mountMeethods() {
      await this.getListOfMatches();
      await this.fetchScoresNew();
    },
    async getListOfMatches() {
      let lastMatch = null;
      this.allMatchDetailsArr = await getDocNmsFromColl(
        this.apiScoreCardCollection
      );
      this.allMatchDetailsArr.sort();
      for (const m in this.allMatchDetailsArr) {
        let matchInfo = this.allMatchDetailsArr[m].split("_");
        this.matchDetailsArr.push(
          "Match No: " + matchInfo[0] + " " + matchInfo[2]
        );
        if (m == this.allMatchDetailsArr.length - 1) {
          lastMatch = matchInfo;
        }
      }
      this.lastMatchInfo = {
        matchNo: lastMatch[0],
        id: lastMatch[1],
        teams: lastMatch[2],
      };
    },
    teamLink(teamNm) {
      // console.log("team.name : "+teamNm)
      return "/" + this.$route.params.teamId + "/teamView/" + teamNm;
    },
    async fetchScoresNew() {
      // this.lastMatchInfo = await getLastMatchInfo();
      this.showScoreCardOfMatch =
        "Match No: " +
        this.lastMatchInfo.matchNo +
        " " +
        this.lastMatchInfo.teams;
      let totalPoints = await getFieldDataFromDoc(
        "AuctionTeams",
        this.team + "_Standings",
        this.lastMatchInfo.matchNo +
          "_" +
          this.lastMatchInfo.id +
          "_" +
          this.lastMatchInfo.teams
      );
      debugPoint("TTTT")
      totalPoints.sort(
        (a, b) => parseFloat(b.totalPoints) - parseFloat(a.totalPoints)
      );

      debugPoint("totalPoints : " + JSON.stringify(totalPoints));
      // await fetchTeamWiseTotalPoints(this.team);
      this.teamWiseTotalPoints = JSON.parse(
        JSON.stringify(totalPoints).replaceAll("-", "")
      );

      debugPoint(this.lastMatchInfo);
    },
    async getScoreCardOfMatch() {
      let matchInfoNeeded = null;
      debugPoint("getScoreCardOfMatch()");
      let matchInfoNo = this.showScoreCardOfMatch.match(/\d+/)[0];
      debugPoint(matchInfoNo);
      for (const m in this.allMatchDetailsArr) {
        let match = this.allMatchDetailsArr[m].split("_");
        if (matchInfoNo == match[0]) {
          debugPoint(this.allMatchDetailsArr[m]);
          matchInfoNeeded = match;
          break;
        }
      }
      if (matchInfoNeeded == null) {
        alert("Technical Error!!");
        return undefined;
      }
      this.lastMatchInfo = {
        matchNo: matchInfoNeeded[0],
        id: matchInfoNeeded[1],
        teams: matchInfoNeeded[2],
      };
      this.fetchScoresNew();
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

.team-row:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

.team th,
.team-row td {
  padding: 10px;
  text-align: center;
  font-weight: normal;
  vertical-align: middle;
}

.team-row th {
  font-weight: bold;
}

.team-row td:first-child {
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-row td:first-child img {
  height: 16px;
  margin-right: 4px;
}

.team-row td:first-child span {
  font-size: 80%;
}

#matchDiv {
  margin-bottom: 30px;
}

#matchDropDown {
  font-size: 16px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 300px;
}

#matchDropDown option {
  background-color: #ffffff;
  /* color: #333333; */
  color: #efe8e85d;
}
</style>
