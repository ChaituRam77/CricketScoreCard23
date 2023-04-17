<template>
  <div class="btn-group">
  <div class="dropdown">
    <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
    Select owner
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Action</a></li>
    <li><a class="dropdown-item" href="#">Another action</a></li>
    <li><a class="dropdown-item" href="#">Something else here</a></li>
  </ul>
</div>
<div class="dropdown">
    <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
    Small button
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Action</a></li>
    <li><a class="dropdown-item" href="#">Another action</a></li>
    <li><a class="dropdown-item" href="#">Something else here</a></li>
  </ul>
</div>
</div>
</template>
<script>

export default {
  data() {
    return {
      teams: [],
      matches: [],
      teamInDisplay: 'Select Team',
      matchInDisplay: 'Select Match',
    }
  },
  mounted() {
    // this.fetchMatches();
  },
  methods: {
    
  }
}
</script>

<style>
.dropdown {
  margin-left: 16px;
  margin-right: 16px;
  padding: 20px 0px;
  left:auto; /* added */
}

</style>
