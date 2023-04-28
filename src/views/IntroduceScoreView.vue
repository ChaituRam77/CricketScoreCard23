<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6 offser-md-3">
        <h2>Introduce match details</h2>
      </div>
      <form @submit.prevent="validsecretkeyAndProceed">
        <div class="form-group row">
          <label for="inputMatchID" class="col-sm-2 col-form-label"
            >Match ID</label
          >
          <div class="col-sm-10">
            <input
              type="text"
              class="form-control"
              id="inputMatchID"
              placeholder="00000"
              v-model="matchID"
            />
          </div>
        </div>
        <div class="form-group row">
          <label for="secretKey" class="col-sm-2 col-form-label"
            >Secret Key</label
          >
          <div class="col-sm-10">
            <input
              type="password"
              class="form-control"
              id="inputPassword"
              placeholder="*******"
              v-model="secretKey"
            />
          </div>
        </div>
        <button type="submit" class="btn btn-primary bg-primary">Submit</button>
      </form>
    </div>
  </div>
</template>

<script>
import {
  addFieldToDB,
  addMapFieldToDB,
  updateFieldToDB,
  getDocNmsFromColl,
  getFieldDataFromDoc,
  deleteDocFromCollection,
  deleteValueFromDoc,
  setDocToCollection,
  debugPoint,
} from "../firebase-config";
import { getTeamWiseTotalPoints, getLastMatchInfo } from "../final-api-wrapper";
import axios from "axios";

export default {
  data() {
    return {
      matchID: null,
      matchNm: null,
      team1: null,
      team2: null,
      mom: null,
      secretKey: null,
      showlogs: null,
      useAPI: null,
      writeToDB: null,
      playersMap: new Map(),
      playersScore: new Map(),
      playersBowling: new Map(),
      playersCatchingStumping: new Map(),
      playersRunOuts: new Map(),
      playersBowlingBowledLbw: new Map(),
      playersNickName: new Map(),
      playersNickNameAsValue: new Map(),
      globalNickNameMapForMatch: new Map(),
      playersSubstitute: [],
      apiScore: {},
      obj: {},
      switchValues: {
        name: "bName",
        total: "atotal",
        runs: "runs",
        fours: "fours",
        sixes: "sixes",
        bowling: "wickets",
        bowledLbw: "bowledNlbw",
        hitwkt: "hitwkt",
        maiden: "maiden",
        catching: "catch",
        stumping: "stump",
        runOuts: "runout",
        directhit: "directhit",
        substitute: "in11",
        potm: "potm",
      },
      matchDetails: null,
      teamCollectionArray: [
        "TeamA_Darshan",
        "TeamA_Dots",
        "TeamA_JD",
        "TeamA_Kiruba",
        "TeamA_PnV",
        "TeamA_Prabu",
        "TeamA_RK",
        "TeamA_Ragu",
        "TeamA_Ragul",
        "TeamB_Anand",
        "TeamB_Chaitu",
        "TeamB_Dinesh",
        "TeamB_Gokul",
        "TeamB_Laxman",
        "TeamB_Praneeth",
        "TeamB_Raja",
        "TeamB_Rajesh",
        "TeamB_Rama",
        "TeamB_Vinit",
      ],
      recentMatchOwnerPoints: new Map(),
    };
  },
  methods: {
    async introduceMatchScore() {
      let scorecard = new Map();
      // this.showlogs = true;
      // this.useAPI = true;
      // this.writeToDB = true;
      // this.matchID = "66169";
      if (this.useAPI) {
        const options = {
          method: "GET",
          url:
            "https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/" +
            this.matchID +
            "/hscard",
          headers: {
            "X-RapidAPI-Key":
              "427451b511msh07056d18c6e0adcp1dae07jsn577cf6594d98",
            "X-RapidAPI-Host": "cricbuzz-cricket.p.rapidapi.com",
          },
        };
        await axios
          .request(options)
          .then((response) => {
            this.apiScore = response.data;
            this.consoleLog(this.apiScore.scoreCard);
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        this.apiScore = require("../data/sampleResponse.json");
      }
      scorecard = this.apiScore.scoreCard;
      this.matchDetails =
        scorecard[0].matchId +
        "_" +
        scorecard[0].batTeamDetails.batTeamShortName +
        "vs" +
        scorecard[1].batTeamDetails.batTeamShortName;
      this.consoleLog("response recieve : " + this.matchDetails);
      let batId = 0;
      let bowlerId = 0;
      let wicketCode = "";
      for (let i = 0; i < scorecard.length; i++) {
        this.consoleLog("Inside loop");
        let batsmenData = scorecard[i].batTeamDetails.batsmenData; // Get the batsmenData object for the current innings
        this.consoleLog(`Innings ${i + 1}:`);
        // Iterate over the batsmenData object and log the details of each batsman
        for (const [key, value] of Object.entries(batsmenData)) {
          this.consoleLog(`Batsman ${key}:`);
          this.consoleLog(`Name: ${value.batName}`);
          this.consoleLog(`Runs: ${value.runs}`);
          this.consoleLog(`Balls faced: ${value.balls}`);
          this.consoleLog(`Strike rate: ${value.strikeRate}`);
          this.consoleLog(`Out description: ${value.outDesc}`);
          this.consoleLog("---");
          batId = parseInt(`${value.batId}`);
          this.chkKeyExistsInMapNAssign(batId);
          this.playersMap.get(batId).bName = `${value.batName}`;
          this.playersMap.get(batId).runs = parseInt(`${value.runs}`);
          this.playersMap.get(batId).fours = parseInt(`${value.boundaries}`);
          this.playersMap.get(batId).sixes = parseInt(`${value.sixers}`);
          this.playersMap.get(batId).runs = parseInt(`${value.runs}`);
          let outDesc = `${value.outDesc}`;
          if (!outDesc == "") {
            wicketCode = `${value.wicketCode}`;
            bowlerId = parseInt(`${value.bowlerId}`);
            let fielderId1 = parseInt(`${value.fielderId1}`);
            let fielderId2 = parseInt(`${value.fielderId2}`);
            if (!(bowlerId == 0)) {
              this.chkKeyExistsInMapNAssign(bowlerId);
              // this.playersMap.get(bowlerId).wickets =
              //   this.playersMap.get(bowlerId).wickets + 1;
              // BOWLED LBW : 60042
              if (wicketCode == "BOWLED" || wicketCode == "LBW") {
                this.playersMap.get(bowlerId).bowledNlbw =
                  this.playersMap.get(bowlerId).bowledNlbw + 1;
              }
              //HITWKT : 46136
              if (wicketCode == "HITWKT") {
                this.playersMap.get(bowlerId).hitwkt =
                  this.playersMap.get(bowlerId).hitwkt + 1;
              }
              // STUMPED : 60016 --- CAUGHTBOWLED : 56229
              if (wicketCode == "CAUGHTBOWLED" || wicketCode == "CAUGHT") {
                if (wicketCode == "CAUGHTBOWLED") {
                  fielderId1 = bowlerId;
                }
                this.chkKeyExistsInMapNAssign(fielderId1);
                this.playersMap.get(fielderId1).catch =
                  this.playersMap.get(fielderId1).catch + 1;
              }
              if (wicketCode == "STUMPED") {
                this.chkKeyExistsInMapNAssign(fielderId1);
                this.playersMap.get(fielderId1).stump =
                  this.playersMap.get(fielderId1).stump + 1;
              }
            }
            // RUNOUT : 60042
            if (wicketCode == "RUNOUT") {
              this.chkKeyExistsInMapNAssign(fielderId1);
              if (!fielderId2 == 0) {
                this.playersMap.get(fielderId1).runout =
                  this.playersMap.get(fielderId1).runout + 1;
                this.chkKeyExistsInMapNAssign(fielderId2);
                this.playersMap.get(fielderId2).runout =
                  this.playersMap.get(fielderId2).runout + 1;
              } else {
                this.playersMap.get(fielderId1).directhit =
                  this.playersMap.get(fielderId1).directhit + 1;
              }
            }
            // sub : 66176
            if (outDesc.includes("(sub)")) {
              this.playersMap.get(fielderId1).in11 = "N";
              let catcher = outDesc.substring(2, outDesc.indexOf(" b "));
              this.playersMap.get(fielderId1).bName = catcher.replace(
                "(sub)",
                ""
              );
            }
          }
        }
        let bowlersData = scorecard[i].bowlTeamDetails.bowlersData;
        for (const [key, value] of Object.entries(bowlersData)) {
          bowlerId = parseInt(`${value.bowlerId}`);
          this.chkKeyExistsInMapNAssign(bowlerId);
          this.playersMap.get(bowlerId).bName = `${value.bowlName}`;
          this.playersMap.get(bowlerId).wickets = parseInt(`${value.wickets}`);
          this.playersMap.get(bowlerId).maiden = parseInt(`${value.maidens}`);
        }
      }

      let potmId = parseInt(this.apiScore.matchHeader.playersOfTheMatch[0].id);
      this.consoleLog("potmId : " + potmId);
      this.chkKeyExistsInMapNAssign(potmId);
      this.playersMap.get(potmId).potm = "Y";

      this.playersMap.forEach(async (value, key) => {
        const map = new Map(Object.entries(value));
        this.playersMap.get(key).atotal = this.claculateTotalNew(map);
        this.consoleLog(
          key +
            " : " +
            this.playersMap.get(key).bName +
            " " +
            JSON.stringify(value)
        );
        //setDoc Merge false not working - writting only last
        //setDoc Merge true not working - second write iincludes first records

        // if (this.useAPI) {
        //   await updateDocToCollection(
        //     "ApiScoreCard",
        //     this.matchDetails,
        //     key,
        //     value
        //   );
        // }
      });

      if (this.writeToDB) {
        await addMapFieldToDB(
          "ApiScoreCard",
          this.matchDetails,
          this.playersMap
        );
      }
      await this.asignMatchPointsToOwner();

      await this.assignScoreCardToDB();

      alert(this.matchID + " scores updated");
    },

    consoleLog(valueToprint) {
      if (this.showlogs) {
        console.log(valueToprint);
      }
    },

    async assignOwnerstoDB() {
      let obj = require("../data/ownersTeamA.json");
      const map = new Map();
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          map.set(key, obj[key]);
        }
      }
      map.forEach(async (value, key) => {
        // console.log("Key : " + key);
        // console.log("Value : " + JSON.stringify(obj[key]));
        let objOwn = {};
        value.forEach(async (element) => {
          console.log(element.name + element.name);
          objOwn[element.id] = {
            bName: element.name,
            category: element.category,
            team: element.team,
            price: element.auctionPrice,
          };
        });
        await updateFieldToDB("AuctionTeams", "TeamB", key, objOwn);
      });
    },

    async asignMatchPointsToOwner() {
      // let matchDetails = ["66169_CSKvsGT", "66173_PBKSvsKKR", "66176_LSGvsDC", "66183_RRvsSRH", "66190_MIvsRCB", "66197_CSKvsLSG"]
      // this.matchID = "66169_CSKvsGT"
      // this.writeToDB = true
      this.showlogs = true;
      this.consoleLog(this.matchDetails);
      const ownersData = ["TeamA", "TeamB"];
      // debugPoint("Point 1");
      // let lastMatchInfo = await getLastMatchInfo();
      for (let i = 0; i < ownersData.length; i++) {
        // this.consoleLog("Team : " + ownersData[i]);
        let obj = require("../data/owners" + ownersData[i] + ".json");
        const map = new Map();

        for (const key in obj) {
          // assign obj to map
          if (obj.hasOwnProperty(key)) {
            map.set(key, obj[key]);
          }
        }
        map.forEach(async (value, key) => {
          const dbCollectionName = ownersData[i] + "_" + key;
          let ownerOverAllPoints = 0;
          let playersMatchMap = new Map();
          if (this.writeToDB) {
            ownerOverAllPoints = await getFieldDataFromDoc(
              dbCollectionName,
              "1TotalPoints",
              "1total"
            );
          }

          // this.consoleLog("Owner : " + key);
          // this.consoleLog("Players : " + JSON.stringify(value));
          let totalPointsforMatch = 0;
          value.forEach(async (element) => {
            // this.consoleLog("PlayersItreator : " + JSON.stringify(element));
            if (this.playersMap.has(element.id)) {
              // this.consoleLog("PickedPlayerID : " + element.id);
              totalPointsforMatch =
                totalPointsforMatch + this.playersMap.get(element.id).atotal;
              playersMatchMap.set(element.id, this.playersMap.get(element.id));
            }
          });
          let newOverAllPoints = totalPointsforMatch + ownerOverAllPoints;
          console.log(
            "key : " +
              key +
              " points : " +
              totalPointsforMatch +
              " exisitingOverAllPoints : " +
              ownerOverAllPoints +
              " newTotal : " +
              newOverAllPoints
          );
          this.recentMatchOwnerPoints.set(key, {
            points: totalPointsforMatch,
            exisitingOverAllPoints: ownerOverAllPoints,
            newTotal: newOverAllPoints,
          });
          playersMatchMap.set("1total", totalPointsforMatch);

          if (this.writeToDB) {
            await addMapFieldToDB(
              dbCollectionName,
              this.matchDetails,
              playersMatchMap
            );
            await setDocToCollection(
              dbCollectionName,
              "1TotalPoints",
              "1total",
              newOverAllPoints
            );
            await setDocToCollection(
              dbCollectionName,
              "1TotalPoints",
              this.matchDetails,
              totalPointsforMatch
            );
          }
        });

        console.log(
          "this.recentMatchOwnerPoints : " +
            [...this.recentMatchOwnerPoints.entries()]
        );
      }
    },

    async assignScoreCardToDB() {
      this.writeToDB;
      debugPoint("assignScoreCardToDB()");
      let ownersData = ["TeamA", "TeamB"];
      let recentMatchInfo = await getLastMatchInfo();
      for (let i = 0; i < ownersData.length; i++) {
        this.consoleLog("Team : " + ownersData[i]);
        debugPoint("updateFieldToDB");
        let totalPoints = await getTeamWiseTotalPoints(ownersData[i], true);
        // let totalPointsArr = [];
        // for (const [t] of totalPoints.entries()) {
        //   let ownerPoints = {
        //     lastMatchPoints: totalPoints[t].lastMatchPoints,
        //     name: totalPoints[t].name,
        //     totalPoints: totalPoints[t].totalPoints,
        //     no: totalPoints[t].no,
        //     rankChange: totalPoints[t].rankChange,
        //   };
        //   totalPointsArr.push(ownerPoints);
        // }
        // const totalPointsArr = totalPoints.map((obj)=> {return Object.assign({}, obj)});
        // totalPointsArr = totalPoints;
        // console.log("totalPointsArr : " + JSON.stringify(totalPoints));
        if (this.writeToDB) {
          await addFieldToDB(
            "AuctionTeams",
            ownersData[i] + "_Standings",
            recentMatchInfo.matchNo +
              "_" +
              recentMatchInfo.id +
              "_" +
              recentMatchInfo.teams,
            JSON.parse(JSON.stringify(totalPoints))
          );
        }
      }
    },

    async resetOwnersDB() {
      matchDetails = await getDocNmsFromColl("ApiScoreCard");
      let collectionArray = [
        "TeamA_Darshan",
        "TeamA_Dots",
        "TeamA_JD",
        "TeamA_Kiruba",
        "TeamA_PnV",
        "TeamA_Prabu",
        "TeamA_RK",
        "TeamA_Ragu",
        "TeamA_Ragul",
        "TeamB_Anand",
        "TeamB_Chaitu",
        "TeamB_Dinesh",
        "TeamB_Gokul",
        "TeamB_Laxman",
        "TeamB_Praneeth",
        "TeamB_Raja",
        "TeamB_Rajesh",
        "TeamB_Rama",
        "TeamB_Vinit",
      ];

      for (let index = 0; index < collectionArray.length; index++) {
        for (let m = 0; m < matchDetails.length; m++) {
          await deleteDocFromCollection(
            collectionArray[index],
            matchDetails[m]
          );
        }

        await setDocToCollection(
          collectionArray[index],
          "1TotalPoints",
          "1total",
          0
        );
      }
    },

    async cleanMatchScoreFromDB() {
      let matchScoreToDelete = "66285_MIvsSRH";
      await deleteDocFromCollection("ApiScoreCard", matchScoreToDelete);
      // var teamArr = this.teamCollectionArray.filter((name) =>
      //   name.includes("TeamA")
      // );
      var teamArr = this.teamCollectionArray;
      debugPoint("Point 1");
      for (const [o] of teamArr.entries()) {
        const owner = teamArr[o];

        let ownerOverAllPoints = await getFieldDataFromDoc(
          owner,
          "1TotalPoints",
          "1total"
        );

        let deleteMatchPoints = await getFieldDataFromDoc(
          owner,
          "1TotalPoints",
          matchScoreToDelete
        );

        let newOverAllPoints = ownerOverAllPoints - deleteMatchPoints;
        debugPoint("Point 3");

        if (newOverAllPoints !== "NaN") {
          await setDocToCollection(
            owner,
            "1TotalPoints",
            "1total",
            newOverAllPoints
          );

          await deleteValueFromDoc(owner, "1TotalPoints", matchScoreToDelete);

          await deleteDocFromCollection(owner, matchScoreToDelete);
        } else {
          alert("error iin clean up process, please verify!!!");
        }
      }
    },

    async garage() {
      const ownersData = ["TeamA", "TeamB"];
      let lastMatchInfo = await getLastMatchInfo();
      for (let i = 0; i < ownersData.length; i++) {
        debugPoint("With Map");
        let totalPoints = await getTeamWiseTotalPoints(ownersData[i], true);

        let totalPointsMap = [];

        totalPointsMap = totalPoints;

        await addFieldToDB(
          "AuctionTeams",
          ownersData[i] + "_Standings",
          lastMatchInfo.matchNo +
            "_" +
            lastMatchInfo.id +
            "_" +
            lastMatchInfo.teams,
          totalPointsMap
        );
      }
    },
    async mockTest() {
      const playersData = {
        atotal: 0,
        bName: "",
        bowledNlbw: 0,
        catch: 0,
        stump: 0,
        fours: 0,
        in11: "Y",
        potm: "N",
        runout: 0,
        directhit: 0,
        runs: 100,
        sixes: 0,
        wickets: 0,
        hitwkt: 0,
        maiden: 0,
      };
      this.playersMap.set(222, playersData);
      let value = {};
      value = this.playersMap.get(222);
      console.log(value);
      console.log(" " + JSON.stringify(value));
      const playersMap = new Map(Object.entries(value));

      let wickets = playersMap.get(this.switchValues.bowling);
      let bowlingPoints =
        wickets > 2 ? wickets * 20 + (wickets > 4 ? 20 : 10) : wickets * 20;

      console.log(
        "bowlingPoints" +
          bowlingPoints +
          "Maiden : " +
          playersMap.get(this.switchValues.maiden) * 20 +
          "bowledLbw : " +
          playersMap.get(this.switchValues.bowledLbw) * 5 +
          "hitwkt : " +
          playersMap.get(this.switchValues.hitwkt) * 5
      );
      bowlingPoints =
        bowlingPoints +
        playersMap.get(this.switchValues.maiden) * 20 +
        playersMap.get(this.switchValues.bowledLbw) * 5 +
        playersMap.get(this.switchValues.hitwkt) * 5;
      console.log("bowlingPoints : " + bowlingPoints);
      this.claculateTotalNew(playersMap);
      // console.log([...Object.entries(playersMap)])
      // console.log(Array.from(playersMap.entries()));
    },
    claculateTotalNew(scoreMap) {
      let battingPoints = 0;
      let bowlingPoints = 0;
      let catchingPoints = 0;
      let runOutPoints = 0;
      let directHitPoints = 0;
      let stumpingPoints = 0;
      let totalPoints = 0;
      let runs = scoreMap.get(this.switchValues.runs);
      battingPoints =
        runs > 29
          ? runs > 49
            ? runs + (runs > 99 ? 25 : 15)
            : runs + 5
          : runs;
      battingPoints =
        battingPoints +
        scoreMap.get(this.switchValues.fours) * 1 +
        scoreMap.get(this.switchValues.sixes) * 2;
      this.consoleLog("battingPoints : " + battingPoints);
      let wickets = scoreMap.get(this.switchValues.bowling);
      bowlingPoints =
        wickets > 2 ? wickets * 20 + (wickets > 4 ? 20 : 10) : wickets * 20;
      bowlingPoints =
        bowlingPoints +
        scoreMap.get(this.switchValues.maiden) * 20 +
        scoreMap.get(this.switchValues.bowledLbw) * 5 +
        scoreMap.get(this.switchValues.hitwkt) * 5;
      this.consoleLog("bowlingPoints : " + bowlingPoints);
      catchingPoints = scoreMap.get(this.switchValues.catching) * 5;
      this.consoleLog("catchingPoints : " + catchingPoints);
      runOutPoints = scoreMap.get(this.switchValues.runOuts) * 5;
      this.consoleLog("runOutPoints : " + runOutPoints);
      directHitPoints = scoreMap.get(this.switchValues.directhit) * 10;
      this.consoleLog("directHitPoints : " + directHitPoints);
      stumpingPoints = scoreMap.get(this.switchValues.stumping) * 10;
      this.consoleLog("stumpingPoints : " + stumpingPoints);
      totalPoints =
        battingPoints +
        bowlingPoints +
        catchingPoints +
        runOutPoints +
        directHitPoints +
        stumpingPoints +
        (scoreMap.get(this.switchValues.substitute) == "Y" ? 2 : 0) +
        (scoreMap.get(this.switchValues.potm) == "Y" ? 30 : 0);
      this.consoleLog("totalPoints : " + totalPoints);
      return totalPoints;
    },
    chkKeyExistsInMapNAssign(id) {
      const playersData = {
        atotal: 0,
        bName: "",
        bowledNlbw: 0,
        catch: 0,
        stump: 0,
        fours: 0,
        in11: "Y",
        potm: "N",
        runout: 0,
        directhit: 0,
        runs: 0,
        sixes: 0,
        wickets: 0,
        hitwkt: 0,
        maiden: 0,
      };
      if (!this.playersMap.has(id)) {
        this.playersMap.set(id, playersData);
        return true;
      }
      return false;
    },
    async validsecretkeyAndProceed() {
      if (this.secretKey == "HailKing") {
        this.showlogs = false;
        this.useAPI = true;
        this.writeToDB = true;
        // this.matchNm = this.matchID + "_" + this.team1 + "vs" + this.team2;
        // let matchExistsInDB = await getFieldDataFromDoc(
        //   "ApiScoreCard",
        //   this.matchNm
        // );
        //if (this.writeToDB && matchExistsInDB !== undefined) {
        //  alert("Match ID already introduced!!!");
        //  return undefined;
        // }
        this.introduceMatchScore();
      } else {
        alert("Invalid Secret Key");
        return undefined;
      }
    },
  },
};
</script>

<style></style>
