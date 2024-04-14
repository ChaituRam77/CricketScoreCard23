import db, { debugPoint } from "./firebase-config";
import {
  getDataFromDoc,
  getDocNmsFromColl,
  getFieldDataFromDoc,
} from "./firebase-config";
import { collection, getDocs } from "firebase/firestore";

let matchWisePoints = new Map();

let teamCollectionArray = [
  "TeamA_Darshan",
  "TeamA_Dots",
  "TeamA_Kiruba",
  "TeamA_Prabu",
  "TeamA_Prakash",
  "TeamA_Ragu",
  "TeamA_RK",
  "TeamA_JD",
  "TeamB_Anand",
  "TeamB_Chaitanya",
  "TeamB_Charan",
  "TeamB_Dinesh",
  "TeamB_Gokul",
  "TeamB_Harish",
  "TeamB_Raja",
  "TeamB_Karthi",
  "TeamB_Rama",
  "TeamB_Prabha",
  "TeamB_Sreeni"
];

export function getOwnersOfTeam(teamName) {
  // debugPoint("getOwnersOfTeam("+teamName+")")
  let ownrArr = teamCollectionArray.filter((name) => name.includes(teamName));
  ownrArr = ownrArr.map((ownerNm) => ownerNm.replace(teamName + "_", ""));
  return ownrArr;
}

export function getTeamOfSelectedOwner(teamName, ownerName) {
  debugPoint("0");
}

export async function getOwnerNames() {
  const DOC_REFERENCE = collection(db, "Owners");
  const DOC_SNAPSHOT = await getDocs(DOC_REFERENCE);

  let ownerDocsMap = new Map();
  DOC_SNAPSHOT.docs.map((doc) => ownerDocsMap.set(doc.id, doc.data()));

  let ownerTeamsMap = new Map(Object.entries(ownerDocsMap.get("teams")));

  let owners = ownerTeamsMap.get("Names");
  return owners;
}

export async function getMatches() {
  const manOfTheMatchList = await getDataFromDoc("MatchScores");
  let allMatches = [];
  for (const [k] of manOfTheMatchList.entries()) {
    let matchSplit = k.split("_");
    let matchId = matchSplit[0];
    let matchVsTeams = matchSplit[1];
    allMatches.push({
      id: matchId,
      teams: matchVsTeams,
      matchNo: (matchId - 45881) / 5,
    });
    allMatches.sort((a, b) => parseFloat(a.matchNo) - parseFloat(b.matchNo));
  }
  return allMatches;
}

export async function getLastMatchInfo() {
  let listOfMatches = await getDocNmsFromColl("ApiScoreCardNew");
  //handle first match
  console.log("listOfMatches.length: " + listOfMatches.length);
  let lastMatchData = listOfMatches[listOfMatches.length - 1].split("_");
  console.log(lastMatchData);
  let lastMatchInfo = {
    id: lastMatchData[1],
    teams: lastMatchData[2],
    matchNo: lastMatchData[0],
  };
  return lastMatchInfo;
}

export async function getTeamWiseTotalPoints(team, cashImg) {
  let teamWiseTotalPoints = [];
  let lastMatchRankMap = new Map();
  let listOfMatches = await getDocNmsFromColl("ApiScoreCardNew");
  //for first match rank logic is not applicable
  if (listOfMatches.length > 1) {
    let lastMatchScorecard = await getFieldDataFromDoc(
      "AuctionTeams",
      team + "_Standings",
      listOfMatches[listOfMatches.length - 2]
    );
    // console.log("lastMatchScorecard : "+JSON.stringify(lastMatchScorecard))
    for (const [i] of lastMatchScorecard.entries()) {
      lastMatchRankMap.set(
        lastMatchScorecard[i].name,
        lastMatchScorecard[i].no
      );
    }
  }
  var teamArr = teamCollectionArray.filter((name) => name.includes(team));
  for (let index = 0; index < teamArr.length; index++) {
    let ownerName = teamArr[index];
    let totalPoints = await getFieldValueWithWhileLoop(
      200,
      ownerName,
      "1TotalPoints",
      "0total"
    );

    let recentMatchId = listOfMatches[listOfMatches.length - 1];
    // console.log("recentMatchId : " + recentMatchId);
    let lastMatchTotal = await getFieldValueWithWhileLoop(
      30,
      ownerName,
      "1TotalPoints",
      recentMatchId
    );

    const nameArr = ownerName.split("_");
    let teamScore = {
      name: nameArr[1],
      lastMatchPoints: lastMatchTotal,
      totalPoints: totalPoints,
    };
    teamWiseTotalPoints.push(teamScore);
  }
  // console.log("teamWiseTotalPoints 1 : " + JSON.stringify(teamWiseTotalPoints));
  teamWiseTotalPoints.sort(
    (a, b) => parseFloat(b.totalPoints) - parseFloat(a.totalPoints)
  );
  // console.log("teamWiseTotalPoints 2 : " + JSON.stringify(teamWiseTotalPoints));
  let rank;
  for (const [i] of teamWiseTotalPoints.entries()) {
    if (i < 3 && !cashImg) {
      teamWiseTotalPoints[i].no = "💵";
    } else {
      teamWiseTotalPoints[i].no = i + 1;
      //keep rank as 0 for first match
      if (listOfMatches.length > 1) {
        rank = lastMatchRankMap.get(teamWiseTotalPoints[i].name) - (i + 1);
      } else {
        rank = 0;
      }
      let rankChange = rank > 0 ? "⬆" + rank : rank < 0 ? "⬇" + rank : "➖";
      rankChange = rankChange.replace("-", "");
      teamWiseTotalPoints[i].rankChange = rankChange;
    }
  }
  // console.log("teamWiseTotalPoints 3 : " + JSON.stringify(teamWiseTotalPoints));

  return teamWiseTotalPoints;
}

async function getFieldValueWithWhileLoop(
  iterationCount,
  colNm,
  DocNm,
  fieldNm
) {
  // console.log(
  //   "Inside getFieldValueWithWhileLoop() - colNm :" +
  //     colNm +
  //     " DocNm : " +
  //     DocNm +
  //     " fieldNm : " +
  //     fieldNm
  // );
  let loopExitCount = 0;
  let fieldValue = null;
  while (
    (fieldValue == null || fieldValue == undefined) &&
    loopExitCount < iterationCount
  ) {
    fieldValue = await getFieldDataFromDoc(colNm, DocNm, fieldNm);
    loopExitCount++;
  }
  console.log(
    "Collection Nm : " +
      colNm +
      " loopExitCount : " +
      loopExitCount +
      " DocNm : " +
      DocNm +
      " fieldValue : " +
      fieldValue
  );
  return fieldValue;
}

export async function fetchTeamWiseTotalPoints(team) {
  let listOfMatches = await getDocNmsFromColl("ApiScoreCardNew");
  var teamArr = teamCollectionArray.filter((name) => name.includes(team));
  for (let index = 0; index < teamArr.length; index++) {
    let ownerName = teamArr[index];
    const nameArr = ownerName.split("_");
    let owner = nameArr[1];
    matchWisePoints.set(owner, []);

    for (let m = 0; m < listOfMatches.length; m++) {
      let match = listOfMatches[m];
      let matchInfo = match.split("_");
      let matchId = matchInfo[0];
      let matchVs = matchInfo[1];
      let matchNo = listOfMatches.indexOf(listOfMatches[m]) + 1;
      let teamTotalPoints = await getFieldDataFromDoc(
        ownerName,
        "1TotalPoints",
        listOfMatches[m]
      );

      let matchWiseTeamPoints = {
        matchId: matchId,
        matchVs: matchVs,
        matchNo: matchNo,
        points: teamTotalPoints == undefined ? "---" : teamTotalPoints,
      };

      matchWisePoints.get(owner).push(matchWiseTeamPoints);
    }
    matchWisePoints
      .get(owner)
      .sort((a, b) => parseFloat(a.matchNo) - parseFloat(b.matchNo));
  }

  console.log("matchWisePoints : " + matchWisePoints);

  return matchWisePoints;
}

export async function fetchOwnerMatchWisePoints(ownerName) {
  var ownerDbCollNm = teamCollectionArray.filter((name) =>
    name.includes(ownerName)
  );
  let listOfMatches = await getDataFromDoc(ownerDbCollNm[0], "1TotalPoints");

  let matchWisePoints = [];
  // listOfMatches.forEach( (value, key) => {
  for (let [key, value] of listOfMatches) {
    if (key == "0total") {
      continue;
    }
    let match = key;
    let matchInfo = match.split("_");
    let matchNo = matchInfo[0];
    let matchId = matchInfo[1];
    let matchVs = matchInfo[2];
    // let matchNo = listOfMatches.indexOf(listOfMatches[m]) + 1;
    // matchNo = matchNo + 1;
    let ownerMatchPoints = {
      matchId: matchId,
      matchVs: matchVs,
      matchNo: matchNo,
      matchKey: match,
      points: value,
    };
    matchWisePoints.push(ownerMatchPoints);
  }
  // );

  // console.log("matchWisePoints : " +matchWisePoints);

  return matchWisePoints;
}

export async function fetchOwnerMatchPlayerWisePoints(ownerName, matchName) {
  var ownerDbCollNm = teamCollectionArray.filter((name) =>
    name.includes(ownerName)
  );
  let playerPointsMap = await getDataFromDoc(ownerDbCollNm[0], matchName);
  let playerWisePoints = [];
  for (let [key, value] of playerPointsMap) {
    if (key == "0total") {
      continue;
    }
    let playerscore = {
      name: value.bName,
      total: value.atotal,
      bowledNlbw: value.bowledNlbw,
      catch: value.catch,
      directhit: value.directhit,
      fours: value.fours,
      hitwkt: value.hitwkt,
      in11: value.in11,
      maiden: value.maiden,
      potm: value.potm,
      runout: value.runout,
      runs: value.runs,
      sixes: value.sixes,
      wickets: value.wickets,
      stump: value.stump,
    };
    playerWisePoints.push(playerscore);
  }
  return playerWisePoints;
}

export function getMatchWisePoints(teamName) {
  // console.log(`Get match wise points for team ${teamName}`)
  let points = matchWisePoints.get(teamName);
  return points;
}
