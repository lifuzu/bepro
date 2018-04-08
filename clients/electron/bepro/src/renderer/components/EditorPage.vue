<template>
  <div id="wrapper">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    <vue-editor
      :customModules="customModulesForEditor"
      :editorOptions="editorSettings"
      v-model="content">
    </vue-editor>
  </div>
</template>

<script>
  import { VueEditor } from 'vue2-editor'
  // import { ImageDrop } from 'quill-image-drop-module'
  // import ImageResize from 'quill-image-resize-module'

  export default {
    components: {
      VueEditor
    },
    data () {
      return {
        content: '<h1>Initial Content</h1>'
      }
    },
    customModulesForEditor: [
      // { alias: 'imageDrop', module: ImageDrop }
      // { alias: 'imageResize', module: ImageResize }
    ],
    editorSettings: {
      modules: {
        // imageDrop: true
        // imageResize: {}
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
  }

</style>