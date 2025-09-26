<template>
  <nav class="sidebar-nav">
    <div v-for="(item) in value" :key="item.value" @click="onClick_select(item.value)" :class="{ 'active': activeValue === item.value }">
      <svg v-if="item.icon === 'newChat'" class="nav-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
        <path d="M535.722667 42.666667l26.026666 0.085333c226.304 12.458667 407.04 193.194667 419.584 421.845333v23.68a439.68 439.68 0 0 1-47.189333 199.253334 445.568 445.568 0 0 1-568.832 212.48l-12.629333-5.504-253.866667 84.650666a42.666667 42.666667 0 0 1-55.210667-49.450666l1.28-4.522667 84.565334-253.909333-5.461334-12.586667a439.850667 439.850667 0 0 1-33.706666-154.453333l-0.213334-15.957334a445.568 445.568 0 0 1 246.229334-398.378666A439.893333 439.893333 0 0 1 535.722667 42.666667z m23.68 85.333333h-23.808a354.816 354.816 0 0 0-160.981334 38.186667 360.32 360.32 0 0 0-199.210666 322.218666c-0.128 55.893333 12.928 110.933333 38.101333 160.810667a42.666667 42.666667 0 0 1 2.389333 32.725333l-63.146666 189.269334 189.312-63.104a42.666667 42.666667 0 0 1 27.52 0.213333l5.205333 2.176c49.877333 25.173333 104.96 38.229333 160.896 38.101333a360.362667 360.362667 0 0 0 322.218667-199.381333c25.173333-49.834667 38.229333-104.96 38.101333-160.810667l0.085333-21.461333c-10.112-182.869333-156.16-328.917333-336.64-338.944zM533.333333 298.666667a42.666667 42.666667 0 0 1 42.666667 42.666666v106.666667H682.666667a42.666667 42.666667 0 0 1 0 85.333333h-106.666667V640a42.666667 42.666667 0 0 1-85.333333 0v-106.666667H384a42.666667 42.666667 0 0 1 0-85.333333h106.666667V341.333333a42.666667 42.666667 0 0 1 42.666666-42.666666z"></path>
      </svg>
      {{ item.text }}
    </div>
  </nav>
</template>

<script>
export default {
  name: 'sideBarNav',
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      activeValue: null,
    }
  },
  mounted() {
    if (this.value && this.value.length > 0) {
      this.activeValue = this.value[0].value;
    }
  },
  methods: {
    /**
     * 点击导航项时触发
     * @param {string} value 导航项的值
     */
    onClick_select(value) {
      this.activeValue = value;
      this.$emit('select', value);
    }
  }
}
</script>

<style scoped>
.sidebar-nav {
  font-size: 16px;
  line-height: 150%;
  padding: 8px;
}
.sidebar-nav>div {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.sidebar-nav>div:hover {
  background-color: var(--bg--color-deep);
}
.sidebar-nav>div.active {
  background-color: var(--blue-2);
  color: white;
  font-weight: 500;
}
.sidebar-nav>div.active:hover {
  background-color: var(--blue-2-hover);
}
.nav-icon path {
  fill: #707070;
  transition: fill 0.2s ease;
}
.sidebar-nav>div.active .nav-icon path {
  fill: #e6e6e6;
}
</style>