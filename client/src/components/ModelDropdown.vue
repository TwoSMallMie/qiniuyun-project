<template>
  <div class="dropdown">
    <div class="dropdown-header" @click="toggle">
      {{ selected.label }}
      <span class="arrow" :class="{ open: open }">▼</span>
    </div>
    <div v-if="open" class="dropdown-menu">
      <div class="dropdown-title">选择人物</div>
      <div class="dropdown-divider"></div>
      <div v-for="item in options" :key="item.value" class="dropdown-item" @click="select(item)">
        <div class="item-row">
          <span class="item-label">{{ item.label }}</span>
          <span class="item-desc">{{ item.desc }}</span>
          <span v-if="selected.value === item.value" class="item-check">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#165DFF" stroke-width="2"/><circle cx="9" cy="9" r="5" fill="#165DFF"/></svg>
          </span>
          <span v-else class="item-check">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#D9D9D9" stroke-width="2"/><circle cx="9" cy="9" r="5" fill="#fff"/></svg>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModelDropdown',
  props: {
    value: {
      type: String,
      default: 'value1',
    },
    options: {
      type: Array,
      default: () => [
        { value: 'value1', label: '选择1' },
        { value: 'value2', label: '选择2' },
        { value: 'value3', label: '不会吧不会吧，你要选选择3' },
      ],
    },
  },
  data() {
    return {
      open: false,
      selected: this.options.find(o => o.value === this.value) || this.options[0],
    }
  },
  watch: {
    value(val) {
      this.selected = this.options.find(o => o.value === val) || this.options[0];
    }
  },
  methods: {
    toggle() {
      this.open = !this.open;
    },
    select(item) {
      this.selected = item;
      this.open = false;
      this.$emit('input', item.value);
    }
  }
}
</script>

<style scoped>
.dropdown {
  position: relative;
  width: 200px;
  font-family: inherit;
}
.dropdown-header {
  font-size: 14px;
  padding: 4px;
  color: #222;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background 0.2s;
  border-radius: 4px;
}
.dropdown-header:hover,
.dropdown-header:focus {
  background: #f5f6fa;
}
.arrow {
  margin-left: 8px;
  transition: transform 0.2s;
}
.arrow.open {
  transform: rotate(180deg);
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  z-index: 10;
  padding: 9px 0 6px 0;
}
.dropdown-title {
  font-size: 14px;
  color: #888;
  padding: 0 12px 6px 12px;
}
.dropdown-divider {
  height: 1px;
  background: #eee;
  margin: 0 12px 6px 12px;
}
.dropdown-item {
  cursor: pointer;
  padding: 6px 12px;
  transition: background 0.2s;
}
.dropdown-item:hover {
  background: #f5f6fa;
}
.item-row {
  display: flex;
  align-items: center;
}
.item-label {
  font-size: 12px;
  color: #222;
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-desc {
  font-size: 12px;
  color: #888;
  margin-left: 8px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-check {
  margin-left: 8px;
  display: flex;
  align-items: center;
}
</style>
