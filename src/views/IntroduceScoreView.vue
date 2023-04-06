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
import db, {
  addMapFieldToDB,
  updateFieldToDB,
  getAllDocs,
  getDocNmsFromColl,
} from "../firebase-config";
import {
  getFieldDataFromDoc,
  getDataFromDoc,
  addFieldToDB,
  addDocToCollection,
  updateDocToCollection,
  deleteDocFromCollection,
  setDocToCollection,
  addDocToColl,
} from "../firebase-config";
import {getTeamWiseTotalPoints} from "../final-api-wrapper"
import { doc, updateDoc } from "firebase/firestore";
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
    };
  },
  methods: {
    async work(){
      await getTeamWiseTotalPoints()
    },
    async test() {
      await getAllDocs();
      let scorecard = new Map();
      this.showlogs = true;
      this.useAPI = true;
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
              if (!fielderId2 == 0) {
                this.chkKeyExistsInMapNAssign(fielderId1);
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

      if (this.useAPI) {
          await addMapFieldToDB(
            "ApiScoreCard",
            this.matchDetails,
            this.playersMap
          );
        }
      await this.asignMatchPointsToOwner();

      alert(this.matchID +" scores updated")

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
      // this.showlogs = true
      this.consoleLog(this.matchDetails);
      const ownersData = ["TeamA", "TeamB"];
      for (let i = 0; i < ownersData.length; i++) {
        this.consoleLog("Team : " + ownersData[i]);
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
          let playersMatchMap = new Map()
          if (this.useAPI) {
            ownerOverAllPoints = await getFieldDataFromDoc(
              dbCollectionName,
              "1TotalPoints",
              "1total"
            );
          }

          this.consoleLog("Owner : " + key);
          this.consoleLog("Players : " + JSON.stringify(value));
          let totalPointsforMatch = 0;
          value.forEach(async (element) => {
            this.consoleLog("PlayersItreator : " + JSON.stringify(element));
            if (this.playersMap.has(element.id)) {
              this.consoleLog("PickedPlayerID : " + element.id);
              totalPointsforMatch =
                totalPointsforMatch + this.playersMap.get(element.id).atotal;

                playersMatchMap.set(element.id, this.playersMap.get(element.id));

              // if (this.useAPI) {
              //   await addDocToCollection(
              //     dbCollectionName,
              //     this.matchDetails,
              //     element.id,
              //     this.playersMap.get(element.id)
              //   );
              // }
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
          
          playersMatchMap.set("1total",
              totalPointsforMatch)

            

          if (this.useAPI) {
            // await addDocToCollection(
            //   dbCollectionName,
            //   this.matchDetails,
            //   "1total",
            //   totalPointsforMatch
            // );
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
      }
    },

    async resetOwnersDB() {

      let matchDetails = ["1TotalPoints","66169_CSKvsGT", "66173_PBKSvsKKR", "66176_LSGvsDC", "66183_RRvsSRH", "66190_MIvsRCB", "66197_CSKvsLSG"]
      // matchDetails = await getDocNmsFromColl("ApiScoreCard");
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
    async createFieldInDb(document, matchNm) {
      const docRef = doc(db, "Owners", document);
      await updateDoc(docRef, {
        [matchNm]: { "1total": 0 },
      }).catch((err) => {
        console.log("error: " + err.message);
      });
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
    async temp() {
      // await deleteOwnerDocs();
      let scoreMap = await getDataFromDoc("MatchScores");
      // scoreMap.clear();
      // scoreMap.set("45976_DCvsKKR", "Kuldeep Yadav");
      console.log(scoreMap);
      for (let [key, value] of scoreMap) {
        this.showlogs = true;
        this.useAPI = false;
        this.writeToDB = true;
        this.matchNm = key;
        let matchNmData = key.split("_");
        this.matchID = matchNmData[0];
        this.team1 = matchNmData[1].split("vs")[0];
        this.team2 = matchNmData[1].split("vs")[1];
        this.matchID = matchNmData[0];
        this.mom = value;
        console.log(
          this.matchID + "|" + this.team1 + "|" + this.team2 + "|" + this.mom
        );
        await this.introduceMatchScore();
      }
    },
    async validsecretkeyAndProceed() {
      if (this.secretKey == "HailKing") {
        // this.showlogs = true;
        // this.useAPI = true;
        // this.writeToDB = true;
        // this.matchNm = this.matchID + "_" + this.team1 + "vs" + this.team2;
        // let matchExistsInDB = await getFieldDataFromDoc(
        //   "ApiScoreCard",
        //   this.matchNm
        // );
        //if (this.writeToDB && matchExistsInDB !== undefined) {
        //  alert("Match ID already introduced!!!");
        //  return undefined;
        // }
        this.test();
      } else {
        alert("Invalid Secret Key");
        return undefined;
      }
    },
    async introduceMatchScore() {
      let scorecard = new Map();
      let playersMatch = new Map();
      let matchScoreTotalPoints = 0;
      let ownerMatchTotalPoints = new Map();
      let ownerTotalPoints = new Map();
      this.apiScore = {};
      let globalNickNameMap = new Map(
        Object.entries(require("../data/NickNames"))
      );
      let team1NickNameMap = new Map(
        Object.entries(globalNickNameMap.get(this.team1))
      );
      let team2NickNameMap = new Map(
        Object.entries(globalNickNameMap.get(this.team2))
      );
      this.globalNickNameMapForMatch = new Map([
        ...team1NickNameMap,
        ...team2NickNameMap,
      ]);
      // console.log(
      //   "globalNickNameMapForMatch : " + [...this.globalNickNameMapForMatch]
      // );
      console.log("Introducing match score");
      playersMatch.set(this.matchID, this.mom);
      if (this.showlogs) console.log("logs : " + this.matchID + this.mom);

      const options = {
        method: "GET",
        url: "https://unofficial-cricbuzz.p.rapidapi.com/matches/get-scorecard",
        params: { matchId: this.matchID },
        headers: {
          "X-RapidAPI-Host": "unofficial-cricbuzz.p.rapidapi.com",
          "X-RapidAPI-Key":
            "427451b511msh07056d18c6e0adcp1dae07jsn577cf6594d98",
        },
      };

      if (this.useAPI) {
        await axios
          .request(options)
          .then((response) => {
            this.apiScore = response.data;
            scorecard = this.apiScore.scorecard;
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        this.apiScore = await getFieldDataFromDoc("ApiScoreCard", this.matchNm);
        scorecard = this.apiScore.scorecard;
      }
      if (this.showlogs) {
        console.log(this.apiScore);
        console.log(scorecard);
      }
      if (this.writeToDB) {
        await addFieldToDB("ApiScoreCard", this.matchNm, this.apiScore);
        await addFieldToDB("MatchScores", this.matchNm, this.mom);
      }
      /***
       * Fetch scores of players & assign to playersScore map
       */

      let m = 1;
      let p = 1;
      this.playersScore.clear();
      this.playersBowling.clear();
      this.playersCatchingStumping.clear();
      this.playersRunOuts.clear();
      this.playersBowlingBowledLbw.clear();
      this.playersNickName.clear();
      this.playersNickNameAsValue.clear();
      this.playersSubstitute = [];

      Object.entries(scorecard).forEach((item) => {
        console.log(
          "Innings : " + m + "........................................"
        );
        m++;
        if (item.batsman !== null) {
          Object.entries(item[1].batsman).forEach((batsman) => {
            let playerScoreSubMap = new Map();
            playerScoreSubMap.clear;
            let plyrNm = batsman[1].name;
            plyrNm = plyrNm.trim();
            if (this.globalNickNameMapForMatch.has(plyrNm)) {
              plyrNm = this.globalNickNameMapForMatch.get(plyrNm);
              console.log(
                "Inside globalNickNameMapForMatch APINm : " +
                  batsman[1].name +
                  " NickNm : " +
                  plyrNm
              );
            }

            if (this.showlogs) {
              console.log(
                plyrNm +
                  " | " +
                  batsman[1].runs +
                  " | " +
                  batsman[1].sixes +
                  " | " +
                  batsman[1].fours
              );
            }

            playerScoreSubMap.set(
              this.switchValues.runs,
              this.getValidScore(batsman[1].runs)
            );
            playerScoreSubMap.set(
              this.switchValues.sixes,
              this.getValidScore(batsman[1].sixes)
            );
            playerScoreSubMap.set(
              this.switchValues.fours,
              this.getValidScore(batsman[1].fours)
            );
            this.playersScore.set(plyrNm, playerScoreSubMap);
            console.log("PLAYER SCORE IS SET.");
            let plyrNickNm = batsman[1].nickName;
            if (this.showlogs) {
              console.log();
            }
            if (plyrNickNm !== undefined) {
              if (this.showlogs)
                console.log("player Nick Name : " + plyrNickNm);
              this.playersNickName.set(plyrNickNm, plyrNm);
              this.playersNickNameAsValue.set(plyrNm, plyrNickNm);
            }
            if (this.showlogs) {
              console.log(
                p + ")Out Desc : " + plyrNm + " - " + batsman[1].outDec
              );
            }
            this.addOutDescrition(batsman[1].outDec);
            p++;
          });
        } else {
          alert("Error : Invalid Scorecard!!!!");
        }
      });
      if (this.showlogs) {
        console.log(this.playersScore);
        console.log("NickNames Map : " + [...this.playersNickName.entries()]);
        console.log("Bowling Map : " + [...this.playersBowling.entries()]);
      }
      this.adjustNameNAssignToPlayerScore(
        this.playersBowling,
        this.switchValues.Bowling
      );
      if (this.showlogs) {
        console.log(
          "CatchStumpMap : " + [...this.playersCatchingStumping.entries()]
        );
      }
      this.adjustNameNAssignToPlayerScore(
        this.playersCatchingStumping,
        this.switchValues.CatchingStumping
      );
      if (this.showlogs) {
        console.log("RunOutsMap : " + [...this.playersRunOuts.entries()]);
      }
      this.adjustNameNAssignToPlayerScore(
        this.playersRunOuts,
        this.switchValues.RunOuts
      );
      if (this.showlogs) {
        console.log(
          "BowledLbwMap : " + [...this.playersBowlingBowledLbw.entries()]
        );
      }
      this.adjustNameNAssignToPlayerScore(
        this.playersBowlingBowledLbw,
        this.switchValues.BowledLbw
      );
      if (this.showlogs) {
        console.log(
          "playersSubstituteMap : " + [...this.playersSubstitute.entries()]
        );
      }
      this.adjustNameNAssignToPlayerScore(
        this.playersSubstitute,
        this.switchValues.Substitute
      );
      this.playersScore.forEach((values, keys) => {
        if (
          this.playersScore.get(keys).get(this.switchValues.Bowling) ==
          undefined
        ) {
          this.playersScore.get(keys).set(this.switchValues.Bowling, 0);
        }
        if (
          this.playersScore.get(keys).get(this.switchValues.BowledLbw) ==
          undefined
        ) {
          this.playersScore.get(keys).set(this.switchValues.BowledLbw, 0);
        }
        if (
          this.playersScore.get(keys).get(this.switchValues.CatchingStumping) ==
          undefined
        ) {
          this.playersScore
            .get(keys)
            .set(this.switchValues.CatchingStumping, 0);
        }
        if (
          this.playersScore.get(keys).get(this.switchValues.RunOuts) ==
          undefined
        ) {
          this.playersScore.get(keys).set(this.switchValues.RunOuts, 0);
        }
        if (
          this.playersScore.get(keys).get(this.switchValues.Substitute) ==
          undefined
        ) {
          this.playersScore.get(keys).set(this.switchValues.Substitute, "Y");
        }
      });
      for (let [key, value] of this.playersScore) {
        let subMap = new Map();
        subMap = value;
        if (key == this.mom) {
          value.set(this.switchValues.mom, "Y");
        } else {
          value.set(this.switchValues.mom, "N");
        }
        value.set("1total", this.claculateTotal(subMap));
        matchScoreTotalPoints = matchScoreTotalPoints + value.get("1total");
        if (this.showlogs) {
          console.log("Player : " + key);
          console.log(Object.fromEntries(value));
        }
      }
      let ownerDocsMap = await getAllDocs();
      let ownerTeamsMap = await getDataFromDoc("teams");
      ownerTeamsMap.delete("Names");
      console.log([...this.playersScore]);
      for (let [keys, values] of ownerTeamsMap) {
        //key : OwnerNames values : team players
        let ownerPlayersArr = values;
        let ownerHasMatchValues = false;
        let ownerMatchObjMap = new Map();
        let ownerMatch1Total = 0;
        let ownerName = keys;
        if (this.showlogs) {
          console.log("Owner Name : " + ownerName);
          console.log(ownerPlayersArr);
        }
        let ownerTeamsTotalPoints = new Map(
          Object.entries(ownerDocsMap.get(ownerName))
        );

        ownerMatchTotalPoints.set(ownerName, 0);
        ownerTotalPoints.set(ownerName, ownerTeamsTotalPoints.get("1total"));
        for (let i = 0; i < ownerPlayersArr.length; i++) {
          const element = `${ownerPlayersArr[i]}`;
          for (let [keys, values] of this.playersScore) {
            // keys : match played players & values :their scores
            let matchPlayer = `${keys}`;
            let playerPoints = new Map();
            playerPoints = values;
            if (
              this.playersNickNameAsValue.has(element) &&
              this.playersNickNameAsValue.get(element) == keys
            ) {
              if (element.toUpperCase() !== keys.toUpperCase()) {
                element == this.playersNickNameAsValue.get(element);
                console.log(
                  "Nick Name " +
                    element +
                    " as Player Name of Owner" +
                    ownerName
                );
              }
            }

            if (element.toUpperCase() === matchPlayer.toUpperCase()) {
              ownerHasMatchValues = true;
              let ownerMatchPoints = ownerMatchTotalPoints.get(ownerName);
              let newPoints = ownerMatchPoints + playerPoints.get("1total");
              ownerMatchTotalPoints.set(ownerName, newPoints);
              let ownerNewPoints = ownerMatchTotalPoints.get(ownerName);
              let playerPointsObj = Object.fromEntries(playerPoints);
              ownerMatchObjMap.set(element, playerPointsObj);
              ownerMatch1Total = ownerMatch1Total + playerPoints.get("1total");

              if (this.showlogs) {
                console.log(
                  ownerName +
                    " | " +
                    keys +
                    " | " +
                    playerPoints.get("1total") +
                    " | " +
                    ownerNewPoints
                );
              }
            }
          }
        }
        if (ownerHasMatchValues) {
          if (this.writeToDB) {
            let ownerMatchPointsObj = Object.assign(
              { "1total": ownerMatch1Total },
              Object.fromEntries(ownerMatchObjMap)
            );
            await addFieldToDB(ownerName, this.matchNm, ownerMatchPointsObj);
          }
        } else {
          await addFieldToDB(ownerName, this.matchNm, 0);
        }
      }
      if (this.showlogs) console.log(ownerMatchTotalPoints);
      /**
       * DB write overall 1Total Owner Name
       * Doc : ownerName
       */
      if (this.writeToDB) {
        for (let [key, value] of ownerMatchTotalPoints) {
          let ownerMatchTotalPoints = value + ownerTotalPoints.get(key);
          const docRef = doc(db, "Owners", key);
          await updateDoc(docRef, {
            "1total": value + ownerTotalPoints.get(key),
          });
        }
      }
      console.log(
        "**************************Updated******************************************"
      );
      alert("Updated successfully");
    },
  },
};
</script>

<style></style>
