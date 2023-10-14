<template>
  <div>
    <div>
      <div>
      <h2 class="section-heading">Batting Calculation</h2>
    </div>
      <table class="styled-table">
        <thead>
          <tr style="background-color: rgb(0, 94, 255); color: white;">
            <th>Criteria</th>
            <th>Points Awarded</th>
            <!-- <th>Header 3</th> -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in battingCrieria" :key="row.id">
            <td>{{ row.column1 }}</td>
            <td>{{ row.column2 }}</td>
            <!-- <td>{{ row.column3 }}</td> -->
          </tr>
        </tbody>
      </table>
    </div>

    <!-- <div style="margin-top: 20px;"></div> -->

    <div>
      <div>
      <h2 class="section-heading">Bowling Calculation</h2>
    </div>
      <table class="styled-table">
        <thead>
          <tr style="background-color:  rgb(0, 94, 255); color: white;">
            <th>Criteria</th>
            <th>Points Awarded</th>
            <!-- <th>Header C</th> -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in bowlingCrieria" :key="row.id">
            <td>{{ row.column1 }}</td>
            <td>{{ row.column2 }}</td>
            <!-- <td>{{ row.column3 }}</td> -->
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <div>
      <h2 class="section-heading">Fielding Calculation</h2>
    </div>
      <table class="styled-table">
        <thead>
          <tr style="background-color:  rgb(0, 94, 255); color: white;">
            <th>Criteria</th>
            <th>Points Awarded</th>
            <!-- <th>Header C</th> -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in fieldingCrieria" :key="row.id">
            <td>{{ row.column1 }}</td>
            <td>{{ row.column2 }}</td>
            <!-- <td>{{ row.column3 }}</td> -->
          </tr>
        </tbody>
      </table>
      <p class="statements">
        Player of the match will be awarded 50 points.
        <br />
        If player is in starting playing 11, will be awarded 5 points..
      </p>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      battingCrieria: [
        { id: 1, column1: '1 run', column2: '1' },
        { id: 2, column1: 'Boundry 4', column2: '1' },
        { id: 3, column1: 'Boundry 6', column2: '2' },
        { id: 4, column1: '>=50 runs', column2: '10' },
        { id: 5, column1: '>=100 runs', column2: '10' },
        { id: 6, column1: '>=150 runs', column2: '10' },
      ],
      bowlingCrieria: [
        { id: 1, column1: '1 wicket', column2: '25' },
        { id: 2, column1: '>= 3 wickets', column2: '10' },
        { id: 3, column1: '>= 5 wickets', column2: '10' },
        { id: 4, column1: '>= 6 wickets', column2: '10' },
        { id: 5, column1: 'Maiden', column2: '10' },
        { id: 6, column1: 'LBW', column2: '10' },
        { id: 6, column1: 'Bowled', column2: '10' },
        { id: 6, column1: 'HitWicket', column2: '10' },
      ],
      fieldingCrieria: [
        { id: 1, column1: 'Catch', column2: '10' },
        { id: 2, column1: 'Runout (direct hit)', column2: '10' },
        { id: 3, column1: 'Run out (Thrower/Catcher)', column2: '5' },
        { id: 4, column1: 'Stumping', column2: '10' },
      ],
    };
  }
};
</script>
<style>
/* Center the tables on the page */
.table-section {
  margin: 20px 0;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.section-heading {
  font-weight: bold; /* Make the text bold */
  margin-right: 10px; /* Add space between h2 and the table */
}

.styled-table {
  border-collapse: collapse;
  width: 100%;
}

.styled-table th, .styled-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.space {
  margin-top: 20px;
}
.statements {
  text-align: center;
  font-weight: bold;
  margin-top: 10px; /* Add space between the table and statements */
}
</style>