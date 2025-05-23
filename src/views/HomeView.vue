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
    <table v-if="isDataReady" class="table table-borderless table-sm table-hover" id="scoresTable">
      <thead>
        <tr class="bg-secondary bg-gradient text-white">
          <th scope="col"></th>
          <th scope="col">#</th>
          <th scope="col">Team</th>
          <th scope="col">Match Points</th>
          <th scope="col">Overall Points</th>
        </tr>
      </thead>

      <tbody class="team" v-for="team in teamWiseTotalPoints" :key="team">
        <tr>

          <td>
            <div style="display: flex; align-items: center">
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
                {{
                  team.rankChange
                    .replace("⬆", "")
                    .replace("⬇", "")
                    .replace("➖", "")
                }}
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
            <router-link :to="teamLink(team.rawName)">
              <a v-html="team.name"></a>
            </router-link>

          </td>
          <td>
            <!-- <p>{{ team.lastMatchPoints }}</p> -->
            <router-link :to="teamLink(team.name)">
              <a :style="getMedalStyle(team.lastMatchPoints)">
                {{ team.lastMatchPoints }}
              </a>
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
import { getMatchWisePoints } from "../final-api-wrapper";
import axios from "axios";
import {
  getFieldDataFromDoc,
  getDocNmsFromColl,
  debugPoint,
} from "../firebase-config";

export default {
  computed: {
    topThreeMatchPoints() {
      debugPoint("topThreeMatchPoints")
      const points = this.teamWiseTotalPoints
        .map((team) => team.lastMatchPoints)
        .sort((a, b) => b - a);
      return points.slice(0, 3);
    },
  },
  data() {
    return {
      imgChevronUp: require("../images/chevron-up.svg"),
      imgChevronDwn: require("../images/chevron-down.svg"),
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
      isDataReady: false
    };
  },
  mounted() {
    debugPoint("start Mounted()")
    this.mountMethods();
    debugPoint("end Mounted()")
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
    async mountMethods() {
      debugPoint("start mountMethods()")
      await this.getListOfMatches();
      await this.fetchScoresNew();
      // await this.appendCapHoldersToOwners();
      debugPoint("end mountMethods()")
    },
    getMedalStyle(points) {
      if (points === this.topThreeMatchPoints[0]) {
        return "color: gold; font-weight: bold;";
      } else if (points === this.topThreeMatchPoints[1]) {
        return "color: silver; font-weight: bold;";
      } else if (points === this.topThreeMatchPoints[2]) {
        return "color: peru; font-weight: bold;"; // bronze-like color
      } else {
        return "";
      }
    },
    async getListOfMatches() {
      debugPoint("start getListOfMatches()")
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
      debugPoint("end getListOfMatches()")
    },
    teamLink(teamNm) {
      // console.log("team.name : "+teamNm)
      return "/" + this.$route.params.teamId + "/teamView/" + teamNm;
    },
    //GET OWNER SCORES FROM DB
    async fetchScoresNew() {
      this.isDataReady = false; // Prevent premature rendering
      debugPoint("start fetchScoresNew()")

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


      totalPoints.sort(
        (a, b) => parseFloat(b.totalPoints) - parseFloat(a.totalPoints)
      );
      this.teamWiseTotalPoints = JSON.parse(
        JSON.stringify(totalPoints).replaceAll("-", "")
      );

      // this.teamWiseTotalPoints = await this.appendCapHoldersToOwners();
      this.isDataReady = true; // Now it's safe to render
      debugPoint("end fetchScoresNew()")
      
    },
    async getScoreCardOfMatch() {
      let matchInfoNeeded = null;
      debugPoint("start getScoreCardOfMatch()");
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
      debugPoint("start getScoreCardOfMatch()");
    },

    dynamicHeading(name) {
      this.greeting = `${name.toUpperCase()} team match-wise points`;
      this.updateMatchWisePoints(name);
    },
    updateMatchWisePoints(teamName) {
      let points = getMatchWisePoints(teamName);
      this.matchWisePoints = points;
    },
    async getCapHolders() {
      const headers = {
        "x-rapidapi-key": "427451b511msh07056d18c6e0adcp1dae07jsn577cf6594d98",
        "x-rapidapi-host": "unofficial-cricbuzz.p.rapidapi.com",
      };

      const runOptions = {
        method: "GET",
        url: "https://unofficial-cricbuzz.p.rapidapi.com/series/get-stats",
        params: { seriesId: "9237", statsType: "mostRuns" },
        headers,
      };

      const wicketOptions = {
        method: "GET",
        url: "https://unofficial-cricbuzz.p.rapidapi.com/series/get-stats",
        params: { seriesId: "9237", statsType: "mostWickets" },
        headers,
      };

      try {
        const [runRes, wicketRes] = await Promise.all([
          axios.request(runOptions),
          axios.request(wicketOptions),
        ]);
        debugPoint("HERE");
        // Extract player ID of the top batsman and bowler
        const orangeCapPlayerId =
          runRes.data.t20Stats[0].values[0].values[0] || "";
        const purpleCapPlayerId =
          wicketRes.data.t20Stats[0].values[0].values[0] || "";
        debugPoint("THERE");
        console.log(
          "orangeCapPlayerID : " +
            orangeCapPlayerId +
            " purpleCapPlayerID : " +
            purpleCapPlayerId
        );
        return { orangeCapPlayerId, purpleCapPlayerId };
      } catch (err) {
        console.error("Error fetching cap data:", err);
        return { orangeCapPlayer: "", purpleCapPlayer: "" };
      }
    },

    async appendCapHoldersToOwners() {
      // Dynamically require the owner's data
      const { orangeCapPlayerId, purpleCapPlayerId } =
        await this.getCapHolders();
      const ownerData = require("../data/owners" + this.team + ".json");
      // Loop through each team score entry and add cap badges to the owner's name
      return this.teamWiseTotalPoints.map((teamEntry) => {
        const ownerName = teamEntry.name;
        const players = ownerData[ownerName] || [];
        const playerIds = players.map((p) => String(p.id));

        const hasOrangeCap = playerIds.includes(String(orangeCapPlayerId));
        const hasPurpleCap = playerIds.includes(String(purpleCapPlayerId));

        let capIcons = "";
        let capClass = "";

        if (hasOrangeCap && hasPurpleCap) {
          capIcons += "🧢🧢";
          capClass = "blue-cap-owner";
        } else if (hasOrangeCap) {
          capIcons += "🧢";
          capClass = "orange-cap-owner";
        } else if (hasPurpleCap) {
          capIcons += "🧢";
          capClass = "purple-cap-owner";
        }

        return {
          ...teamEntry,
          rawName: ownerName,
          name: `
            <span class="owner-with-cap">
              <span class="owner-name ${capClass}">${ownerName}</span>
              <span class="cap-icons">${capIcons}</span>
            </span>
          `,
        };
      });
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
  padding: 12px 15px; /* Increased padding for better spacing with larger font */
  text-align: center;
  font-weight: normal;
  vertical-align: middle;
  font-size: 16px; /* Increased font size for table text */
}

.team-row th {
  font-weight: bold;
  font-size: 18px; /* Increased font size for table headers */
}

.team-row td:first-child {
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-row td:first-child img {
  height: 20px; /* Slightly increased image size to match the larger font */
  margin-right: 6px; /* Increased spacing between image and text */
}

.team-row td:first-child span {
  font-size: 90%; /* Slightly larger than before */
}

#matchDiv {
  margin-bottom: 30px;
}

#matchDropDown {
  font-size: 18px; /* Increased font size for the dropdown */
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 300px;
}

#matchDropDown option {
  background-color: #ffffff;
  color: #333333;
}

/* Wrapper to keep name and caps inline */
.owner-with-cap {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  gap: 4px; /* Space between name and cap(s) */
}

/* Base owner name styling */
.owner-name {
  font-weight: 500;
}

/* Cap icon styling */
.cap-icons {
  font-size: 1rem;
  line-height: 1;
}

/* Specific cap colors */
.orange-cap-owner {
  color: orange;
}

.purple-cap-owner {
  color: purple;
}

.blue-cap-owner {
  color: blue;
}

</style>