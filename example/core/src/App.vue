<template>
  <div id="appMain">
    主系统
    <div class="app-list">
      <div @click="pushItem('/vue')">vue</div>
      <div @click="pushItem('/react')">react</div>
    </div>
    <div id="mainContainer"></div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {

    }
  },
  methods: {
    pushItem(subapp) { history.pushState(null, subapp, subapp) }
  }
}
</script>

<style>
#appMain {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.app-list{
  display: flex;
  justify-content: center;
  margin-top: 10px;
  background: cyan;
  color: rgb(74, 98, 231);
  height: 40px;
  line-height: 40px;
}
.app-list div {
  margin: 0 10px;
}
</style>
