<template>
  <h1 class='fs-3 app-title'><strong>IPL 2025 Points Table</strong></h1>
  <nav>
    <router-link :to="teamLink">Standings</router-link> &nbsp;&nbsp;
    <router-link :to="detailsLink">Teams</router-link> &nbsp;&nbsp;&nbsp;
    <router-link :to="rulesLink">Rules</router-link> &nbsp;&nbsp;&nbsp;
    <!-- <router-link :to="introduceLink"><i class="bi bi-three-dots-vertical"></i></router-link> -->
  </nav>
  <router-view/>
</template>
<script>
export default{
computed:{
  teamLink(){
    return '/'+ this.$route.params.teamId +'/home';
  },
  detailsLink(){
    return '/'+ this.$route.params.teamId +'/detailsView';
  },
  rulesLink(){
    return '/'+ this.$route.params.teamId +'/rules';
  },
  // introduceLink(){
  //   return '/'+ this.$route.params.teamId +'/introduceScore';
  // }
}
};
 
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

.app-title {
  background-color: #0168d0;
  color: #ffffff;
  padding: 0.75em
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
