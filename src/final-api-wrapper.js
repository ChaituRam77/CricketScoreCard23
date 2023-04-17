import db from "./firebase-config";
import {
  getDataFromDoc,
  getDocNmsFromColl,
  getFieldDataFromDoc,
} from "./firebase-config";
import {
  collection,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";

let matchWisePoints = new Map();

let teamCollectionArray = [
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
  let listOfMatches = await getDocNmsFromColl("ApiScoreCard");
  let lastMatchData = listOfMatches[listOfMatches.length - 1].split("_")
  let lastMatchInfo = {
    id: lastMatchData[0],
    teams: lastMatchData[1],
    matchNo: listOfMatches.length,
  }; 
  return lastMatchInfo;
}

export async function getTeamWiseTotalPoints(team, forDB) {
  let teamWiseTotalPoints = [];
  let listOfMatches = await getDocNmsFromColl("ApiScoreCard");
  let lastMatchScorecard = await getFieldDataFromDoc("AuctionTeams",team+"_Standings",listOfMatches.length - 1 +"_"+listOfMatches[listOfMatches.length - 2])
  let lastMatchRankMap = new Map()
  for (const [i] of lastMatchScorecard.entries()) {
    lastMatchRankMap.set(lastMatchScorecard[i].name,lastMatchScorecard[i].no)
  }
  var teamArr = teamCollectionArray.filter(name => name.includes(team))
  for (let index = 0; index < teamArr.length; index++) {
    let ownerName = teamArr[index]; //.replace("TeamA_","");
    let totalPoints = await getFieldDataFromDoc(
      ownerName,
      "1TotalPoints",
      "1total"
    );
    let lastMatchTotal = await getFieldDataFromDoc(
      ownerName,
      "1TotalPoints",
      listOfMatches[listOfMatches.length - 1]
    );
    const nameArr = ownerName.split("_")
    let teamScore = {
      name: nameArr[1],
      lastMatchPoints: lastMatchTotal,
      totalPoints: totalPoints,
    };
    teamWiseTotalPoints.push(teamScore);
  }

  teamWiseTotalPoints.sort(
    (a, b) => parseFloat(b.totalPoints) - parseFloat(a.totalPoints)
  );
  let rank
  for (const [i] of teamWiseTotalPoints.entries()) {
    if (i < 3 && !forDB) {
      teamWiseTotalPoints[i].no = "💵";
    } else {
      teamWiseTotalPoints[i].no = i + 1;
      rank = lastMatchRankMap.get(teamWiseTotalPoints[i].name) - (i + 1);
      teamWiseTotalPoints[i].rankChange = rank >0 ?  "⬆"+ rank : rank < 0 ? "⬇"+ rank : "➖"
    }
  }
  // console.log("teamWiseTotalPoints : "+teamWiseTotalPoints);

  return teamWiseTotalPoints;
}

export async function getTeamWiseTotalPointsOld() {
  const DOC_REFERENCE = collection(db, "Owners");
  const DOC_SNAPSHOT = await getDocs(DOC_REFERENCE);

  let ownerDocsMap = new Map();
  DOC_SNAPSHOT.docs.map((doc) => ownerDocsMap.set(doc.id, doc.data()));

  let ownerTeamsMap = new Map(Object.entries(ownerDocsMap.get("teams")));

  let owners = ownerTeamsMap.get("Names");
  let teamWiseTotalPoints = [];

  for (let i = 0; i < owners.length; i++) {
    let ownerName = owners[i];
    const matchScoresdocRef = doc(db, "Owners", ownerName);

    let ownerMatchScoresMap = new Map();
    ownerMatchScoresMap = new Map(
      Object.entries((await getDoc(matchScoresdocRef)).data())
    );

    let totalPoints = ownerMatchScoresMap.get("1total");
    let map1 = new Map([...ownerMatchScoresMap.entries()].sort());
    let map2 = new Map(Object.entries(Array.from(map1.values()).pop()));
    // let lastKeyInMap = Array.from(map1.keys()).pop();
    let lastMatchTotal = map2.get("1total");
    if (lastMatchTotal == undefined) lastMatchTotal = 0;
    let teamScore = {
      name: ownerName,
      lastMatchPoints: lastMatchTotal,
      totalPoints: totalPoints,
    };
    teamWiseTotalPoints.push(teamScore);
  }
  // console.log(teamWiseTotalPoints)
  teamWiseTotalPoints.sort(
    (a, b) => parseFloat(b.totalPoints) - parseFloat(a.totalPoints)
  );
  for (const [i] of teamWiseTotalPoints.entries()) {
    if (i < 3) {
      teamWiseTotalPoints[i].no = "💵";
    } else {
      teamWiseTotalPoints[i].no = i + 1;
    }
  }
  return teamWiseTotalPoints;
}

export async function fetchTeamWiseTotalPoints(team) {
  let listOfMatches = await getDocNmsFromColl("ApiScoreCard");
  var teamArr = teamCollectionArray.filter(name => name.includes(team))
  for (let index = 0; index < teamArr.length; index++) {
    let ownerName = teamArr[index];
    const nameArr = ownerName.split("_")
    let owner = nameArr[1]
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

  console.log("matchWisePoints : "+matchWisePoints);
}

export async function fetchTeamWiseTotalPointsOld() {
  const docRef = collection(db, "Owners");
  const docSnaps = await getDocs(docRef);
  let ownerDocsMap = new Map();

  docSnaps.docs.map((doc) => ownerDocsMap.set(doc.id, doc.data()));

  let ownerTeamsMap = new Map(Object.entries(ownerDocsMap.get("teams")));
  let ownersArr = ownerTeamsMap.get("Names");

  for (let i = 0; i < ownersArr.length; i++) {
    let ownerMatchScoresMap = new Map();
    const owner = ownersArr[i];
    // console.log("owner : " + owner);
    const matchScoresdocRef = doc(db, "Owners", owner);
    ownerMatchScoresMap = new Map(
      Object.entries((await getDoc(matchScoresdocRef)).data())
    );

    ownerMatchScoresMap.delete("1total");
    matchWisePoints.set(owner, []);

    for (let [match, value] of ownerMatchScoresMap) {
      let matchScoresMap = new Map(Object.entries(value));
      let matchInfo = match.split("_");
      let matchId = matchInfo[0];
      let matchVs = matchInfo[1];
      let matchNo = (matchId - 45881) / 5;
      let teamTotalPoints = matchScoresMap.get("1total");
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
  console.log(matchWisePoints);
}

export function getMatchWisePoints(teamName) {
  // console.log(`Get match wise points for team ${teamName}`)
  let points = matchWisePoints.get(teamName);
  return points;
}
