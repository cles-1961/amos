<template>
  <q-card class=" flex flex-col flex-nowrap overflow-hidden">
    <q-card-section class="bg-main text-white">
      <div class=" text-2xl">
        資料清單
      </div>
      <div class=" ">
        載入並顯示所有資料
      </div>
    </q-card-section>

    <q-card-section class="flex flex-col flex-nowrap gap-2 flex-1">
      <q-file
        v-model="file"
        filled
        label="目標檔案"
        bottom-slots
        accept=".xlsx"
      >
        <template #append>
          <q-icon
            name="create_new_folder"
            @click.stop.prevent
          />
        </template>

        <q-tooltip>
          點擊選擇欲載入的檔案
        </q-tooltip>
      </q-file>

      <div class=" text-lg">
        列表
      </div>

      <q-input
        v-model="keyword"
        label="關鍵字"
        filled
        clearable
      >
        <q-tooltip>
          可以快速過濾、查看原始資料
        </q-tooltip>
      </q-input>

      <q-scroll-area class="h-full">
        <transition-group
          tag="div"
          class="h-full"
          name="list"
        >
          <div
            v-for="datum in data"
            :key="getKey(datum)"
            class="flex gap-[2px] border p-1 mb-2"
          >
            <span
              v-for="(value, key) in datum"
              :key="key"
              class="p-[4px] px-[8px] text-sm tracking-wide text-white rounded duration-300
                 bg-gray-400 hover:bg-gray-600"
            >
              {{ key }}: {{ value }}
            </span>
          </div>
        </transition-group>
      </q-scroll-area>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Workbook } from 'exceljs';
import to from 'await-to-js';
import { zipObject, isNil } from 'lodash-es';

import { useQuasar } from 'quasar';
import { useMainStore } from '../stores/main.store';
import { TableDatum } from '../types/main.type';

const $q = useQuasar();
const store = useMainStore();

const file = ref<File>();
watch(file, async (value) => {
  if (!value) return;

  const workbook = new Workbook();
  const buffer = await value.arrayBuffer();

  const [err] = await to(workbook.xlsx.load(buffer));
  if (err) {
    $q.notify({
      type: 'negative',
      message: '載入資料失敗'
    });
    return;
  }

  const sheet = workbook.worksheets[0];
  const sheetValues = sheet
    .getSheetValues()
    .filter((item) => !isNil(item))
    // 因為 index 從 1 開始，所以去掉 index 0
    .map((item) => {
      const [first, ...values] = item as any[];
      return values;
    });

  const [header, ...rows] = sheetValues as any[];

  const tableData = rows.map((row) => zipObject(header, row)) as TableDatum[];

  store.setData(tableData);
});

const keyword = ref('');
const data = computed(() => {
  if (!keyword.value) {
    return store.data;
  }

  if (!store.data) {
    return [];
  }

  const result = store.data?.filter((datum) => {
    const values = Object.values(datum).join('');
    return values.includes(keyword.value.trim());
  });

  return result;
});
function getKey(data: TableDatum) {
  return Object.values(data).join('-');
}

</script>

<style scoped lang="sass">
</style>
