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
    /***************************************************************
     * 外部调用函数集合 func
     ***************************************************************/


    
    /***************************************************************
     * 工具函数集合 helper
     ***************************************************************/


     
    /***************************************************************
     * 数据函数集合 data
     ***************************************************************/



    /***************************************************************
     * 事件函数集合(部分) onevent_part
     ***************************************************************/


    /***************************************************************
     * 事件函数集合 onevent
     ***************************************************************/



    /***************************************************************
     * 其他函数集合 other
     ***************************************************************/
    this.$router.push('/chat');
  },
}
</script>

<style>
:root {
  --color-blue-7: rgb(51, 126, 204);
  --color-blue-6: #409EFF;
  --color-blue-5: rgb(121, 187, 255);
  --color-blue-4: rgb(160, 207, 255);
  --color-blue-3: rgb(198, 226, 255);
  --color-blue-2: rgb(217, 236, 255);
  --color-blue-1: rgb(236, 245, 255);
  --color-green-1: rgb(240, 249, 235);
  --color-green-2: rgb(225, 243, 216);
  --color-green-3: rgb(209, 237, 196);
  --color-green-4: rgb(179, 225, 157);
  --color-green-5: rgb(149, 212, 117);
  --color-green-6: #67C23A;
  --color-green-7: rgb(82, 155, 46);
  --color-orange-1: rgb(253, 246, 236);
  --color-orange-2: rgb(250, 236, 216);
  --color-orange-3: rgb(248, 227, 197);
  --color-orange-4: rgb(243, 209, 158);
  --color-orange-5: rgb(238, 190, 119);
  --color-orange-6: #E6A23C;
  --color-orange-7: rgb(184, 130, 48);
  --color-red-1: rgb(254, 240, 240);
  --color-red-2: rgb(253, 226, 226);
  --color-red-3: rgb(252, 211, 211);
  --color-red-4: rgb(250, 182, 182);
  --color-red-5: rgb(248, 152, 152);
  --color-red-6: #F56C6C;
  --color-red-7: rgb(196, 86, 86);
  --color-gray-1: rgb(244, 244, 245);
  --color-gray-2: rgb(233, 233, 235);
  --color-gray-3: rgb(222, 223, 224);
  --color-gray-4: rgb(200, 201, 204);
  --color-gray-5: rgb(177, 179, 184);
  --color-gray-6: #909399;
  --color-gray-7: rgb(115, 118, 122);

  --color-blue-tp-7: rgb(51, 126, 204, 128);
  --color-blue-tp-6: #409EFF80;
  --color-blue-tp-5: rgb(121, 187, 255, 128);
  --color-blue-tp-4: rgb(160, 207, 255, 128);
  --color-blue-tp-3: rgb(198, 226, 255, 128);
  --color-blue-tp-2: rgb(217, 236, 255, 128);
  --color-blue-tp-1: rgb(236, 245, 255, 128);
  --color-green-tp-1: rgb(240, 249, 235, 128);
  --color-green-tp-2: rgb(225, 243, 216, 128);
  --color-green-tp-3: rgb(209, 237, 196, 128);
  --color-green-tp-4: rgb(179, 225, 157, 128);
  --color-green-tp-5: rgb(149, 212, 117, 128);
  --color-green-tp-6: #67C23A80;
  --color-green-tp-7: rgb(82, 155, 46, 128);
  --color-orange-tp-1: rgb(253, 246, 236, 128);
  --color-orange-tp-2: rgb(250, 236, 216, 128);
  --color-orange-tp-3: rgb(248, 227, 197, 128);
  --color-orange-tp-4: rgb(243, 209, 158, 128);
  --color-orange-tp-5: rgb(238, 190, 119, 128);
  --color-orange-tp-6: #E6A23C80;
  --color-orange-tp-7: rgb(184, 130, 48, 128);
  --color-red-tp-1: rgb(254, 240, 240, 128);
  --color-red-tp-2: rgb(253, 226, 226, 128);
  --color-red-tp-3: rgb(252, 211, 211, 128);
  --color-red-tp-4: rgb(250, 182, 182, 128);
  --color-red-tp-5: rgb(248, 152, 152, 128);
  --color-red-tp-6: #F56C6C80;
  --color-red-tp-7: rgb(196, 86, 86, 128);
  --color-gray-tp-1: rgb(244, 244, 245, 128);
  --color-gray-tp-2: rgb(233, 233, 235, 128);
  --color-gray-tp-3: rgb(222, 223, 224, 128);
  --color-gray-tp-4: rgb(200, 201, 204, 128);
  --color-gray-tp-5: rgb(177, 179, 184, 128);
  --color-gray-tp-6: #90939980;
  --color-gray-tp-7: rgb(115, 118, 122, 128);

  --text-black: #000000;       /* 黑色文本 */
  --text-main: #303133;        /* 主要文本 */
  --text-normal: #606266;      /* 常规文本 */
  --text-supplement: #909399;  /* 辅助文本 */
  --text-placeholder: #a8abb2; /* 占位符文本 */
  --text-disable: #c0c4cc;     /* 禁用文本 */
  --text-7: #000000;
  --text-6: #303133;
  --text-5: #606266;
  --text-4: #909399;
  --text-3: #a8abb2;
  --text-2: #c0c4cc;
  --text-1: #c0c4cc;
  --border-color-7: #000000;
  --border-color-6: #CDD0D6;
  --border-color-5: #D4D7DE;
  --border-color-4: #DCDFE6;
  --border-color-3: #E4E7ED;
  --border-color-2: #EBEEF5;
  --border-color-1: #F2F6FC;
  --black: #000000;
  --white: #FFFFFF;
  --transparent: #ffffff00;
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
