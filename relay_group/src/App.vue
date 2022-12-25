<template>
  <router-view class="w-full h-full" />
</template>

<script setup lang="ts">
import { useMeta } from 'quasar';

useMeta(() => ({
  title: `Data Grouper`,
  titleTemplate: (title) => `${title} v${import.meta.env.PACKAGE_VERSION}`,
}));

</script>

<style lang="sass">
html, body, #app
  width: 100%
  height: 100%
  padding: 0
  margin: 0

#app
  display: flex
  flex-direction: column
</style>
