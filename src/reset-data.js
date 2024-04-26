import {
    getDocNmsFromColl,
    getFieldDataFromDoc,
    setDocToCollection,
    debugPoint,
  } from "./firebase-config";

 export async function resetOwnersDB(condition) {
    debugPoint("in resetOwnersDB()");
    let matchDetails = [];
    let allMatchDetails = await getDocNmsFromColl(
        app.config.globalProperties.$globalVar
    );
    allMatchDetails.sort();
    //if condition RESET delete all
    if (condition == "RESET") {
      matchDetails = allMatchDetails;
    }
    //if condition RESET_matcID consider only that match
    else if (
      condition.includes("RESET_") ||
      condition.includes("RESETFROM_")
    ) {
      let matchId = condition.replace("RESET_", "").replace("RESETFROM_", "");
      let validCondition = false;
      for (let m in allMatchDetails) {
        let matchFrmArr = allMatchDetails[m];
        if (matchFrmArr.includes(matchId)) {
          validCondition = true;
          if (condition.includes("RESET_")) {
            matchDetails.push(matchFrmArr);
          }
          if (condition.includes("RESETFROM_")) {
            matchDetails = allMatchDetails.slice(parseInt(m));
          }
          break;
        }
      }
      if (!validCondition) {
        alert("Error : Match ID " + matchId + " is not available in DB!!!");
        return undefined;
      }
    }
    for (let m = 0; m < matchDetails.length; m++) {
      debugPoint("HERE");
      // await this.resetPlayerCollectionMatchInfo(matchDetails[m]);
      for (let index = 0; index < this.teamCollectionArray.length; index++) {
        //Delete match in from each owner collection
        await deleteDocFromCollection(
          this.teamCollectionArray[index],
          matchDetails[m]
        );
        //Delete 1TotalPoints doc in each owner collection if its RESET
        if (condition == "RESET") {
          await deleteDocFromCollection(
            this.teamCollectionArray[index],
            this.totalPointsDbDocNm
          );
          //Create 1TotalPoints doc with field 0total as 0
          await setDocToCollection(
            this.teamCollectionArray[index],
            this.totalPointsDbDocNm,
            this.totalPointsDbFieldNm,
            0
          );
        } else {
          //Delete specific match from 1TotalPoints doc in each owner collection
          //Get ownerOverAllTotalPoints
          let ownerTotalPoints = await getFieldDataFromDoc(
            this.teamCollectionArray[index],
            this.totalPointsDbDocNm,
            this.totalPointsDbFieldNm
          );
          //Get ownerMatchTotalPoints
          let ownerMatchPoints = await getFieldDataFromDoc(
            this.teamCollectionArray[index],
            this.totalPointsDbDocNm,
            matchDetails[m]
          );
          let deleteMatchPointsFromTotal =
            ownerTotalPoints - ownerMatchPoints;
          //Delete ownerMatchTotalPoints field from 1TotalPoints doc
          await deleteValueFromDoc(
            this.teamCollectionArray[index],
            this.totalPointsDbDocNm,
            matchDetails[m]
          );
          //assign recalculated ownerOverAllTotalPoints
          await setDocToCollection(
            this.teamCollectionArray[index],
            this.totalPointsDbDocNm,
            this.totalPointsDbFieldNm,
            deleteMatchPointsFromTotal
          );
        }
      }
      //delete each match from APIScorecardCollection
      await deleteDocFromCollection(
        this.apiScoreCardCollection,
        matchDetails[m]
      );
      //delete each match from APIScorecardCollection
      await deleteValueFromDoc(
        this.auctionTeamCollection,
        this.auctionTeamCollTeamADocNm,
        matchDetails[m]
      );
      await deleteValueFromDoc(
        this.auctionTeamCollection,
        this.auctionTeamCollTeamBDocNm,
        matchDetails[m]
      );
    }
  }

  export async function resetPlayerCollectionMatchInfo(matcnNm) {
    let allPlayerDetails = await getDocNmsFromColl(this.playersCollection);
    debugPoint("resetPlayerCollectionMatchInfo()");
    for (let p in allPlayerDetails) {
      //Get MatchTotalPoints
      let matchPoints = await getFieldDataFromDoc(
        this.playersCollection,
        allPlayerDetails[p],
        matcnNm
      );
      if (matchPoints != undefined) {
        debugPoint("resetPlayerCollectionMatchInfo()2");
        //Get OverAllTotalPoints
        let playerTotalPoints = await getFieldDataFromDoc(
          this.playersCollection,
          allPlayerDetails[p].toString(),
          this.totalPointsDbFieldNm
        );

        let deleteMatchPointsFromTotal =
          playerTotalPoints - matchPoints.atotal;
        //assign recalculated OverAllTotalPoints
        await setDocToCollection(
          this.playersCollection,
          allPlayerDetails[p].toString(),
          this.totalPointsDbFieldNm,
          deleteMatchPointsFromTotal
        );
        //delete match details field from players doc
        await deleteValueFromDoc(
          this.playersCollection,
          allPlayerDetails[p].toString(),
          matcnNm
        );
      }
    }
  }

  export async function cleanMatchScoreFromDB() {
    let matchScoreToDelete = "66285_MIvsSRH";
    await deleteDocFromCollection(
      this.apiScoreCardCollection,
      matchScoreToDelete
    );
    // var teamArr = this.teamCollectionArray.filter((name) =>
    //   name.includes("TeamA")
    // );
    var teamArr = this.teamCollectionArray;
    debugPoint("Point 1");
    for (const [o] of teamArr.entries()) {
      const owner = teamArr[o];

      let ownerOverAllPoints = await getFieldDataFromDoc(
        owner,
        this.totalPointsDbDocNm,
        this.totalPointsDbFieldNm
      );

      let deleteMatchPoints = await getFieldDataFromDoc(
        owner,
        this.totalPointsDbDocNm,
        matchScoreToDelete
      );

      let newOverAllPoints = ownerOverAllPoints - deleteMatchPoints;
      debugPoint("Point 3");

      if (newOverAllPoints !== "NaN") {
        await setDocToCollection(
          owner,
          this.totalPointsDbDocNm,
          this.totalPointsDbFieldNm,
          newOverAllPoints
        );

        await deleteValueFromDoc(
          owner,
          this.totalPointsDbDocNm,
          matchScoreToDelete
        );

        await deleteDocFromCollection(owner, matchScoreToDelete);
      } else {
        alert("error iin clean up process, please verify!!!");
      }
    }
  }