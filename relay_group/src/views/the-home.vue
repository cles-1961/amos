<template>
  <div class="flex items-start gap-6 p-6">
    <data-list class="h-full w-[300px]" />
    <data-grouper
      class=" h-full flex-1"
      @update="getGroups"
    />
    <data-exporter
      class=" w-[260px]"
      :groups="groups"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Group } from '../types/main.type';

import DataGrouper from '../components/data-grouper.vue';
import DataList from '../components/data-list.vue';
import DataExporter from '../components/data-exporter.vue';


const groups = ref<Group[]>([]);
function getGroups(value: Group[]) {
  groups.value = value;
}
</script>

<style scoped lang="sass">
</style>
