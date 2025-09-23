<template>
  <div id="app">
    <!-- <nav>
      <router-link to="/">test</router-link>
      <router-link to="/chat">chat</router-link>
    </nav> -->
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  mounted() {
    this.$router.push('/chat');
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

body {
  padding: 0;
  margin: 0;
}
</style>
