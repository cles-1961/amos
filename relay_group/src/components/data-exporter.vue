<template>
  <q-card class=" flex flex-col flex-nowrap">
    <q-card-section class="bg-main text-white">
      <div class="flex flex-col">
        <div class=" text-2xl">
          輸出
        </div>
        <div class=" ">
          將資料依照指定條件分組
        </div>
      </div>
    </q-card-section>

    <q-card-section class="flex flex-col gap-5">
      <base-form ref="baseForm">
        <base-field
          :value="fileName"
          :validator="checkNotEmpty"
        >
          <template #default="{ state }">
            <q-input
              v-model="fileName"
              label="檔案名稱"
              class="w-full"
              filled
              hide-bottom-space
              :error="state.hasError"
            />
          </template>
        </base-field>

        <base-field
          :value="groupText"
          :validator="checkNotEmpty"
        >
          <template #default="{ state }">
            <q-input
              v-model="groupText"
              label="群組 header 文字"
              class="w-full"
              filled
              hide-bottom-space
              :error="state.hasError"
            />
          </template>
        </base-field>
      </base-form>

      <q-btn
        class="w-full"
        color="orange"
        unelevated
        @click="submitExport"
      >
        輸出資料
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { Group } from '../types/main.type';
import { ref, computed } from 'vue';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { cond, constant, flatten, stubTrue } from 'lodash-es';
import { isOptional } from '../common/validator';

import BaseForm from './base-form.vue';
import BaseField from './base-field.vue';

import { useQuasar } from 'quasar';

const $q = useQuasar();

interface Props {
  groups?: Group[];
}
const props = withDefaults(defineProps<Props>(), {
  groups: (): Group[] => [],
});

const fileName = ref('分組資料');
const groupText = ref('組別');

const tableData = computed(() => {
  const data = props.groups.map((group) => {
    const { data, substitutes } = group;

    const datum = [...data, ...substitutes];

    // 加入組別名稱
    const result = datum.map((item) => ({
      ...item, [groupText.value]: group.name,
    }));

    return result;
  });

  return flatten(data);
});
const tableHeaders = computed(() => {
  const keys = Object.keys(tableData.value[0]);
  return keys.map((key) => ({ header: key, key }));
});

function createTable() {
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('分組表');

  sheet.columns = tableHeaders.value;
  sheet.addRows(tableData.value);

  return workbook;
}

async function submitExport() {
  if (props.groups.length === 0) {
    $q.notify({
      type: 'negative',
      message: '無資料可以輸出'
    });
    return;
  }

  if (!baseForm.value) {
    return;
  }

  await baseForm.value.validate();
  const hasAnyError = baseForm.value.errorMessages.some((errorMessage) =>
    errorMessage?.value
  );
  if (hasAnyError) {
    return;
  }

  const table = createTable();
  const bookBuffer = await table.xlsx.writeBuffer();

  saveAs(
    new Blob([bookBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `${fileName.value}.xlsx`
  );
}

const baseForm = ref<InstanceType<typeof BaseForm>>();
const checkNotEmpty = cond([
  [isOptional, constant('不可為空')],
  [stubTrue, constant(undefined)],
]);

</script>

<style scoped lang="sass">
</style>
