<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6 offser-md-3">
        <h2>Introduce match details</h2>
      </div>
      <form @submit.prevent="introduceMatchScore">
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
        <!-- <button type="submit" class="btn btn-primary bg-primary">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Submit
        </button>
      </form> -->
        <button type="submit" class="btn btn-primary bg-primary">Submit</button>
      </form>
      <div v-if="loading" class="d-flex justify-content-center my-3">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  addFieldToDB,
  addMapFieldToDB,
  getDocNmsFromColl,
  getDataFromDoc,
  getFieldDataFromDoc,
  setDocToCollection,
  checkDocExistsInColl,
  debugPoint0,
  debugPoint,
  newdebugPoint,
} from "../firebase-config";
import { getTeamWiseTotalPoints } from "../final-api-wrapper";
import { resetOwnersDB} from "../reset-data";
import axios from "axios";

export default {
  data() {
    return {
      apiScoreCardCollection: "ApiScoreCardNew",
      auctionTeamCollection: "AuctionTeams",
      auctionTeamCollTeamADocNm: "TeamA_Standings",
      auctionTeamCollTeamBDocNm: "TeamB_Standings",
      playersCollection: "Players",
      totalPointsDbDocNm: "00TotalPoints",
      totalPointsDbFieldNm: "0total",
      passKey: " ",
      loading: false,
      matchID: null,
      matchNm: null,
      team1: null,
      team2: null,
      mom: null,
      secretKey: null,
      showlogs: true,
      useAPI: null,
      writeToDB: null,
      playersCollectionFullLogic: null,
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
      pointsRule :{
        run : 1,
        four : 1,
        six : 2,
        runsAdditionalPointsArr : [30,50,100],
        runsAdditionalPointsArrSubSet : [5,10,10],
        // runsAdditionalPoints: 10,
        wicket : 20,
        wicketAdditionalPointsArr : [2,3,5],
        wicketAdditionalPointsArrSubSet : [5,10,10],
        wicketAdditionalPoints: 10,
        maiden : 20,
        bowledLbw : 5,
        hitWicket : 5,
        catch :5,
        runOutDirectHit :10,
        runOutFielders :5,
        stumping : 10,
        in11 : 5,
        potm : 30
      },
      
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
      // teamCollectionArray: [
      //   "TeamA_Darshan",
      //   "TeamA_Dots",
      //   "TeamA_JD",
      //   "TeamA_Kiruba",        
      //   "TeamA_Prabu",
      //   "TeamA_Prakash",
      //   "TeamA_RK",
      //   "TeamA_Ragu",
      //   "TeamB_Anand",
      //   "TeamB_Chaitanya",
      //   "TeamB_Charan",
      //   "TeamB_Dinesh",
      //   "TeamB_Gokul",
      //   "TeamB_Harish",
      //   "TeamB_Karthi",
      //   "TeamB_Prabha",
      //   "TeamB_Raja",
      //   "TeamB_Rama",
      //   "TeamB_Sreeni",
    
      // ],
      teamCollectionArray: [
        "TeamA_Darshan",
        "TeamA_Dots",
        "TeamA_JD",
        "TeamA_Kiruba",        
        "TeamA_Prabu",
        "TeamA_Prakash",
        "TeamA_RK",
        "TeamA_Ragu"
      ],
      recentMatchOwnerPoints: new Map(),
      runoutNotCalculated: [],
      runoutCalculated: [],
      runoutCalculatedPlayersMap: new Map(),
      substituteRunOutNotCalculatedArr: [],
    };
  },
  methods: {
    async garage() {
      this.apiScore = require("../data/sampleResponse.json");
      debugPoint(this.apiScore)

    },
    async introduceMatchScore() {
      let scorecard = new Map();
      scorecard = this.apiScore.scoreCard;
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
          if (outDesc == "not out") {
            outDesc = "";
          }
          if (outDesc != "") {
            wicketCode = `${value.wicketCode}`;
            bowlerId = parseInt(`${value.bowlerId}`);
            let fielderId1 = parseInt(`${value.fielderId1}`);
            let fielderId2 = parseInt(`${value.fielderId2}`);
            let fielderId3 = parseInt(`${value.fielderId3}`);
            if (!(bowlerId == 0)) {
              this.chkKeyExistsInMapNAssign(bowlerId);
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
              if (fielderId2 == 0) {
                //logic for direct hit
                this.playersMap.get(fielderId1).directhit =
                  this.playersMap.get(fielderId1).directhit + 1;
              } else {
                debugPoint("runout");
                this.playersMap.get(fielderId1).runout =
                  this.playersMap.get(fielderId1).runout + 1;
                if (fielderId1 == fielderId2) {
                  fielderId2 = await this.runOutFieldersId(outDesc, fielderId1);
                  fielderId2 = undefined ? 0 : fielderId2;
                }
                if (fielderId2 != undefined) {
                  let fielderRunOutArr = []
                  fielderRunOutArr.push(fielderId2)
                  if (fielderId3 != undefined && fielderId3 != 0) {
                    fielderRunOutArr.push(fielderId3)
                  }
                  for(let id in fielderRunOutArr){
                  let fielderId = parseInt(fielderRunOutArr[id]);
                  debugPoint("fielderRunOutArr fielderId : " + fielderId)
                  this.runoutCalculated.push(outDesc);
                  this.chkKeyExistsInMapNAssign(fielderId);
                  this.playersMap.get(fielderId).runout =
                    this.playersMap.get(fielderId).runout + 1;
                  }
                } else {
                  this.runoutNotCalculated.push(outDesc);
                }
              }
            }
            // debugPoint("sub");
            // sub : 66176
            if (outDesc.includes("(sub)")) {
              debugPoint("sub")
              let fielder1SubNm = null;
              if (fielderId2 == 0) {
                //Satisfies if sub is catcher or direct hit or wicketkeeper
                if(outDesc.includes(" b ")){
                  fielder1SubNm = outDesc.substring(2, outDesc.indexOf(" b "));
                }else{
                  fielder1SubNm = outDesc
                }
                let outDescReplaceArr = ["run out","(sub)","st ","(",")"]
                for(let r in outDescReplaceArr){
                  fielder1SubNm = fielder1SubNm.replace(outDescReplaceArr[r], "");
                }
                fielder1SubNm = fielder1SubNm.trim()
                this.playersMap.get(fielderId1).in11 = "N";
                this.playersMap.get(fielderId1).bName = fielder1SubNm;
              } else {
                if (this.runOutFieldersId.length == 2) {
                  //run out ((sub)Yash Dhull/Salt)
                  let outDescSub = outDesc.split("(sub)").join("");
                  // extract only players names
                  let players = outDescSub
                    .substring(
                      outDescSub.indexOf("(") + 1,
                      outDescSub.indexOf(")")
                    )
                    .split("/");

                  if (outDesc.includes("((sub)")) {
                    //runout first filder is sub
                    this.substituteRunOutLogic(players[0]);
                  }
                  if (outDesc.includes("/(sub)")) {
                    //runout seecond filder is sub
                    this.substituteRunOutLogic(players[1]);
                  }
                } else {
                  this.substituteRunOutNotCalculatedArr.push(outDesc);
                }
                // clear global varaible
                this.runoutCalculatedPlayersMap.clear();
              }
            }
          }
        }


        let bowlersData = scorecard[i].bowlTeamDetails.bowlersData;
        //assigning bolwer details
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

      // create object for each player
      this.playersMap.forEach(async (value, key) => {
        const map = new Map(Object.entries(value));
        let total = this.claculateTotalNew(map);
        this.playersMap.get(key).atotal = total;
        let playerNm = this.playersMap.get(key).bName;
        debugPoint0(key + " : " + playerNm + " " + JSON.stringify(value));
        this.assignPlayersScore(key, playerNm, value, total);
      });
      if (this.writeToDB) {
        await addMapFieldToDB(
          this.apiScoreCardCollection,
          this.matchDetails,
          this.playersMap
        );
      }
      await this.asignMatchPointsToOwner();
      newdebugPoint("Timeout started : "+new Date().toLocaleString());
      await new Promise(resolve => setTimeout(resolve, 7000));
      newdebugPoint("Timeout ended : "+new Date().toLocaleString());
      await this.assignScoreCardToDB();
    },
    substituteRunOutLogic(playerName) {
      debugPoint("substituteRunOutLogic()");
      for (let [plyrId, plyrNm] of this.runoutCalculatedPlayersMap) {
        debugPoint("Inside substituteRunOutLogic()");
        if (
          plyrNm == playerName ||
          playerName.includes(plyrNm) ||
          plyrNm.includes(playerName)
        ) {
          this.playersMap.get(parseInt(plyrId)).in11 = "N";
          this.playersMap.get(parseInt(plyrId)).bName = playerName;
          break;
        }
      }
    },
    async assignPlayersScore(playerId, playerName, scoreObject, matchPoints) {
      let playerIdDoc = playerId.toString();
      try {
        // debugPoint("assignPlayersScore()");
        //If writeToDB is false dont proceed
        if (!this.writeToDB) {
          return undefined;
        }
        let dbCollectionName = this.playersCollection;
        if (this.playersCollectionFullLogic) {
          let playerOverAllPoints = 0;
          //add player to Players collection if not exists
          if (!(await checkDocExistsInColl(dbCollectionName, playerId))) {
            // debugPoint("assignPlayersScore() setPlayer");
            // assign total field to match points
            await setDocToCollection(
              dbCollectionName,
              playerIdDoc,
              this.totalPointsDbFieldNm,
              matchPoints
            );
            // assign player name
            await setDocToCollection(
              dbCollectionName,
              playerIdDoc,
              "0Name",
              playerName
            );
          } else {
            //get player overall points
            playerOverAllPoints = await getFieldDataFromDoc(
              dbCollectionName,
              playerIdDoc,
              this.totalPointsDbFieldNm
            );
            let total = playerOverAllPoints + matchPoints;
            await setDocToCollection(
              dbCollectionName,
              playerIdDoc,
              this.totalPointsDbFieldNm,
              total
            );
          }
        } else {
          await setDocToCollection(
            dbCollectionName,
            playerIdDoc,
            this.totalPointsDbFieldNm,
            matchPoints
          );
          await setDocToCollection(
            dbCollectionName,
            playerIdDoc,
            "0Name",
            playerName
          );
        }
        debugPoint0("assignPlayersScore() for " + playerId);
        await setDocToCollection(
          dbCollectionName,
          playerIdDoc,
          this.matchDetails,
          JSON.parse(JSON.stringify(scoreObject))
        );
      } catch (error) {
        console.log("assignPlayersScore Error : " + error);
        return error;
      }
    },
    async getScoreFromApi() {
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
    },
    consoleLog(valueToprint) {
      if (this.showlogs) {
        console.log(valueToprint);
      }
    },

    async assignOwnerstoDB() {
      const promises = [];
      try {
      let objOwn = {
        key1: 'value1',
        key2: 'value2',
          };
          // await addFieldToDB("AuctionTeams", "TeamA", "Chaitu1", objOwn);
      let obj = require("../data/wc24T20OwnersTeamA.json");
      const map = new Map();
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          map.set(key, obj[key]);
        }
      }
      map.forEach(async (value, key) => {
        console.log("Key : " + key);
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
        // await addFieldToDB("AuctionTeams", "TeamA", key, objOwn);
        promises.push(
        addFieldToDB("AuctionTeams", "TeamA", key, objOwn)
          .then(() => {
            console.log(`Document updated for key: ${key}`);
          })
          .catch((error) => {
            console.error(`Error updating document for key: ${key}`, error);
          })
      );
    });

    // Wait for all promises to complete
    await Promise.all(promises);
    console.log('All Firestore updates completed successfully');
  

      } catch (error) {
        console.log(error.message)
      }

    },

    async asignMatchPointsToOwner() {
      /**
       * In this method match and 1Total documents will be added/updatede to all Owners
       */
      this.consoleLog(this.matchDetails);
      // const ownersData = ["TeamA", "TeamB"];
      const ownersData = ["TeamA"];
      // let lastMatchInfo = await getLastMatchInfo();
      for (let i = 0; i < ownersData.length; i++) {
        // this.consoleLog("Team : " + ownersData[i]);
        let obj = require("../data/wc24T20OwnersTeamA" + ownersData[i] + ".json");
        const map = new Map();

        for (const key in obj) {
          // assign obj to map
          if (obj.hasOwnProperty(key)) {
            map.set(key, obj[key]);
          }
        }
        map.forEach(async (value, key) => {
          // debugPoint("000");
          const dbCollectionName = ownersData[i] + "_" + key;
          let ownerOverAllPoints = 0;
          let playersMatchMap = new Map();
          if (this.writeToDB) {            
            ownerOverAllPoints = await getFieldDataFromDoc(
              dbCollectionName,
              this.totalPointsDbDocNm,
              this.totalPointsDbFieldNm
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
          this.consoleLog(
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
          playersMatchMap.set(this.totalPointsDbFieldNm, totalPointsforMatch);

          if (this.writeToDB) {
            var promises = [];
            newdebugPoint("assignMatchPointsToOwner - PlayersMatchMap : "+new Date().toLocaleString());
             promises.push( await addMapFieldToDB(
              dbCollectionName,
              this.matchDetails,
              playersMatchMap
            ));
            newdebugPoint("assignMatchPointsToOwner - newOverAllPoints : "+new Date().toLocaleString());
            promises.push(await setDocToCollection(
              dbCollectionName,
              this.totalPointsDbDocNm,
              this.totalPointsDbFieldNm,
              newOverAllPoints
            ));
            newdebugPoint("assignMatchPointsToOwner - totalPointsForMatch : "+new Date().toLocaleString());
            promises.push(await setDocToCollection(
              dbCollectionName,
              this.totalPointsDbDocNm,
              this.matchDetails,
              totalPointsforMatch
            ));
            Promise.all(promises);
          }
        });
      }
    },

    async assignScoreCardToDB() {
      // this.showlogs = true;
      // debugPoint("assignScoreCardToDB()");
      // let ownersData = ["TeamA", "TeamB"];
      let ownersData = ["TeamA"];
      // let recentMatchInfo = await getLastMatchInfo();
      for (let i = 0; i < ownersData.length; i++) {
        this.consoleLog("Team : " + ownersData[i]);
        debugPoint("updateFieldToDB");
        let totalPoints = await getTeamWiseTotalPoints(ownersData[i], true);
        if (this.writeToDB) {
          await addFieldToDB(
            this.auctionTeamCollection,
            ownersData[i] + "_Standings",
            this.matchDetails,
            JSON.parse(JSON.stringify(totalPoints))
          );
        }
      }
    },
    async runOutFieldersId(outDesc, fielderId) {
      /**
       *Extract player names from outDesc.
       *Extract possible names for example "Virat Kohli" as Virat and Kohli
       *Call API withh those names and if there is only one occurance in response
        assign it as fielderId
       */

      newdebugPoint("runOutFieldersId(" + outDesc + " , " + fielderId + ")");
      //replace all occurances of "(sub)" in outdesc
      outDesc = outDesc.split("(sub)").join("");
      //extract only players names
      let players = outDesc
        .substring(outDesc.indexOf("(") + 1, outDesc.indexOf(")"))
        .split("/");
      let playersToGetIdArr = [];
      playersToGetIdArr.push(...players);
      let playerSubNmArr = [];
      for (let p in players) {
        let playerNm = players[p].split(" ");
        if (playerNm.length > 1) {
          for (let subNm in playerNm) {
            if (playerNm[subNm].length > 1) {
              playerSubNmArr.push(playerNm[subNm]);
            }
          }
        }
      }
      playersToGetIdArr.push(...playerSubNmArr);
      for (let id in playersToGetIdArr) {
        let playerToGetId = playersToGetIdArr[id];
        console.log("'" + playerToGetId + "'");
        let playersArr = await this.getPlayerIdFromAPI(playerToGetId);
        //For some players (ex : Tilak Varma) API is not returning entire object
        if(playersArr == undefined || playersArr[0].id == undefined){
          continue
        }
        if (playersArr.length == 1 && fielderId != playersArr[0].id) {
          debugPoint("runOutFieldersId : " + playersArr[0].id);
          this.runOutMapAddPlayerDetails(
            players,
            playersArr[0].id,
            fielderId,
            playerToGetId
          );
          return playersArr[0].id;
        } else {
          console.log(
            "Length of runout player id's from API : " + playersArr.length
          );
          for (let pa in playersArr) {
            if (playersArr[pa].name == playerToGetId) {
              debugPoint(playersArr[pa].name);
              if (fielderId != playersArr[pa].id) {
                newdebugPoint("runOutFieldersId : " + playersArr[pa].id);
                this.runOutMapAddPlayerDetails(
                  players,
                  playersArr[pa].id,
                  fielderId,
                  playerToGetId
                );
                return playersArr[pa].id;
              }
            }
          }
        }
      }
      return undefined;
    },
    async runOutMapAddPlayerDetails(
      playersNmArr,
      playerIdFrmApi,
      playerIdDuplicated,
      playerName
    ) {
      debugPoint("runOutMapAddPlayerDetails");
      for (let p in playersNmArr) {
        if (
          playersNmArr[p].includes(playerName) ||
          playersNmArr[p] == playerName
        ) {
          this.runoutCalculatedPlayersMap.set(playerIdFrmApi, playerName);
          // playersNmArr.pop(playersNmArr[p]);
          playersNmArr = playersNmArr.filter(
            (item) => item !== playersNmArr[p]
          );
          this.runoutCalculatedPlayersMap.set(
            playerIdDuplicated,
            playersNmArr[0]
          );
          break;
        }
      }
    },
    async getPlayerIdFromAPI(playerNm) {
      let playerArr = [];
      debugPoint("getPlayerIdFromAPI( "+playerNm+" )")
      const options = {
        method: "GET",
        url: "https://cricbuzz-cricket.p.rapidapi.com/stats/v1/player/search",
        params: { plrN: playerNm },
        headers: {
          "X-RapidAPI-Key":
            "427451b511msh07056d18c6e0adcp1dae07jsn577cf6594d98",
          "X-RapidAPI-Host": "cricbuzz-cricket.p.rapidapi.com",
        },
      };
      try {
        const response = await axios.request(options);
        playerArr = response.data.player;
        console.log(playerArr);
        return playerArr;
      } catch (error) {
        console.error(error);
        return undefined;
      }
    },
    async getPlayerNmFromAPI(playerId) {
      debugPoint("getPlayerNmFromAPI");
      try {
        const options = {
          method: "GET",
          url:
            "https://cricbuzz-cricket.p.rapidapi.com/stats/v1/player/" +
            parseInt(playerId),
          headers: {
            "X-RapidAPI-Key":
              "427451b511msh07056d18c6e0adcp1dae07jsn577cf6594d98",
            "X-RapidAPI-Host": "cricbuzz-cricket.p.rapidapi.com",
          },
        };

        try {
          const response = await axios.request(options);
          console.log("getPlayerNmFromAPI : " + response.data.name);
          return response.data.name;
        } catch (error) {
          debugPoint("error");
          console.error(error);
          return undefined;
        }
      } catch (error) {
        debugPoint("error");
        console.error(error);
        return undefined;
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
      let battingAdditionalPoints = 0;
      let bowlingPoints = 0;
      let bowlingAdditionalPoints = 0;
      let catchingPoints = 0;
      let runOutPoints = 0;
      let directHitPoints = 0;
      let stumpingPoints = 0;
      let totalPoints = 0;
      let runs = scoreMap.get(this.switchValues.runs);
      // battingPoints =
      //   runs > 29
      //     ? runs > 49
      //       ? runs + (runs > 99 ? 25 : 15)
      //       : runs + 5
      //     : runs;
      newdebugPoint("Points");
      let r = 0;
      if(runs > this.pointsRule.runsAdditionalPointsArr[0] - 1){
        this.pointsRule.runsAdditionalPointsArr.forEach(runsAdditionalPointsFor =>{
          if(runs > runsAdditionalPointsFor -1){
            battingAdditionalPoints = battingAdditionalPoints + this.pointsRule.runsAdditionalPointsArrSubSet[r]
            r= r+1;
          }
        })
      }
      
      // battingPoints = 
      //   battingPoints +
      //   scoreMap.get(this.switchValues.fours) * 1 +
      //   scoreMap.get(this.switchValues.sixes) * 2;

      battingPoints = 
        runs * this.pointsRule.run + battingAdditionalPoints +
        scoreMap.get(this.switchValues.fours) * this.pointsRule.four+
        scoreMap.get(this.switchValues.sixes) * this.pointsRule.six;
      this.consoleLog("battingPoints : " + battingPoints);
      let wickets = scoreMap.get(this.switchValues.bowling);
      // bowlingPoints =
      //   wickets > 2 ? wickets * 20 + (wickets > 4 ? 20 : 10) : wickets * 20;
      newdebugPoint("BowlPoints");
      let b = 0;
      if(wickets > this.pointsRule.wicketAdditionalPointsArr[0] - 1){
        this.pointsRule.wicketAdditionalPointsArr.forEach(wicketAdditionalPointsArr =>{
          if(wickets > wicketAdditionalPointsArr -1){
            bowlingAdditionalPoints = bowlingAdditionalPoints + this. pointsRule.wicketAdditionalPointsArrSubSet[b];
            b = b +1;
          }
        })
      }
      // bowlingPoints =
      //   bowlingPoints +
      //   scoreMap.get(this.switchValues.maiden) * 20 +
      //   scoreMap.get(this.switchValues.bowledLbw) * 5 +
      //   scoreMap.get(this.switchValues.hitwkt) * 5;
      bowlingPoints =
        wickets * this.pointsRule.wicket + bowlingAdditionalPoints +
        scoreMap.get(this.switchValues.maiden) * this.pointsRule.maiden +
        scoreMap.get(this.switchValues.bowledLbw) * this.pointsRule.bowledLbw +
        scoreMap.get(this.switchValues.hitwkt) * this.pointsRule.hitWicket;
      this.consoleLog("bowlingPoints : " + bowlingPoints);
      // catchingPoints = scoreMap.get(this.switchValues.catching) * 5;
      catchingPoints = scoreMap.get(this.switchValues.catching) * this.pointsRule.catch;
      this.consoleLog("catchingPoints : " + catchingPoints);
      // runOutPoints = scoreMap.get(this.switchValues.runOuts) * 5;
      runOutPoints = scoreMap.get(this.switchValues.runOuts) * this.pointsRule.runOutFielders;
      this.consoleLog("runOutPoints : " + runOutPoints);
      // directHitPoints = scoreMapt.get(this.switchValues.directhit) * 10;
      directHitPoints = scoreMap.get(this.switchValues.directhit) * this.pointsRule.runOutDirectHit;
      this.consoleLog("directHitPoints : " + directHitPoints);
      // stumpingPoints = scoreMap.get(this.switchValues.stumping) * 10;
      stumpingPoints = scoreMap.get(this.switchValues.stumping) * this.pointsRule.stumping;
      this.consoleLog("stumpingPoints : " + stumpingPoints);
      totalPoints =
        battingPoints +
        bowlingPoints +
        catchingPoints +
        runOutPoints +
        directHitPoints +
        stumpingPoints +
        (scoreMap.get(this.switchValues.substitute) == "Y" ? this.pointsRule.in11 : 0) +
        (scoreMap.get(this.switchValues.potm) == "Y" ? this.pointsRule.potm : 0);
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
      this.loading = true;
      if (this.matchID.includes("RESET") && this.secretKey == this.passKey) {
        await resetOwnersDB(this.matchID);
        alert("DB is reset!!!");
      } else {
        try {
          if (this.secretKey == this.passKey) {
            let scorecard = new Map();
            this.showlogs = false;
            this.useAPI = true;
            this.writeToDB = true;
            this.playersCollectionFullLogic = false;
            await this.getScoreFromApi();
            scorecard = this.apiScore.scoreCard;
            if ((this.apiScore.isMatchComplete = false)) {
              alert("Match is not completed! Retry upon completion.");
              return undefined;
            }
            let matchDesc = this.apiScore.matchHeader.matchDescription
            let matchNo = 0
            if (!matchDesc.includes(" Match")) {
              let listOfMatches = await getDocNmsFromColl("ApiScoreCardNew");
              let lastMatchNo = (listOfMatches[listOfMatches.length -1]).split("_")
              matchNo = parseInt(lastMatchNo[0]) + 1
              debugPoint("matchNo : " + matchNo);
            }else{
              matchNo = matchDesc.match(/\d+/)[0];
            }
            matchNo = matchNo < 10 ? "0" + matchNo : matchNo;
            debugPoint("matchNo : " + matchNo);
            if (matchNo == null || matchNo == undefined) {
              alert("Error : Unable to fetch match number!!");
              return undefined;
            }
            this.matchDetails =
              matchNo +
              "_" +
              scorecard[0].matchId +
              "_" +
              scorecard[0].batTeamDetails.batTeamShortName +
              "vs" +
              scorecard[1].batTeamDetails.batTeamShortName;
            debugPoint("matchDetails : " + this.matchDetails);
            let matchExistsInDB = await getDataFromDoc(
              this.apiScoreCardCollection,
              this.matchDetails
            );
            if (matchExistsInDB !== undefined) {
              this.loading = false;
              alert("Match ID already introduced!!!");
              return undefined;
            }
            let potm = new Map();
            potm = this.apiScore.matchHeader.playersOfTheMatch;
            if (potm.length == 0) {
              this.loading = false;
              alert("Player of the match is not available!!!");
              return undefined;
            }
            await this.introduceMatchScore();
            let msg = "";
            if (!this.runoutCalculated.length == 0) {
              msg =
                "\rInfo: RunOut logic applied for " +
                this.runoutCalculated.toString();
            }
            if (!this.runoutNotCalculated.length == 0) {
              msg =
                msg +
                "\rError: RunOut logic not applied for " +
                this.runoutNotCalculated.toString();
            }
            if (!this.substituteRunOutNotCalculatedArr.length == 0) {
              msg =
                msg +
                "\rSubstitute not applied for " +
                this.substituteRunOutNotCalculatedArr.toString();
            }
            alert(this.matchDetails + " scores updated" + msg);
          } else {
            this.loading = false;
            alert("Invalid Secret Key");
            return undefined;
          }
        } catch (error) {
          this.consoleLog(error);
          alert("Technical Error");
        }
      }
      this.loading = false;
    },
  },
};
</script>

<style></style>
