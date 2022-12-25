<template>
  <q-card class=" flex flex-col flex-nowrap">
    <base-form ref="baseForm">
      <q-card-section class="flex items-center flex-nowrap gap-4 bg-main text-white">
        <div class="flex flex-col">
          <div class=" text-2xl">
            分組器
          </div>
          <div class=" ">
            將資料依照指定條件分組
          </div>
        </div>

        <q-space />

        <transition
          name="scale-in"
          mode="out-in"
        >
          <div
            v-if="errorMessage"
            :key="errorMessage"
            class="flex items-center text-red bg-red-100 p-2 rounded-md"
          >
            {{ errorMessage }}
          </div>
          <div
            v-else
            class="flex items-center gap-2"
          >
            <div class="">
              總數 : {{ statisticalResult.quantity }}
            </div>
            <div class="">
              平均值 : {{ statisticalResult.average }}
            </div>
          </div>
        </transition>

        <base-field
          :value="conditionField"
          :validator="checkNotEmpty"
        >
          <template #default="{ state }">
            <q-select
              v-model="conditionField"
              label="條件"
              filled
              bg-color="white"
              class="w-[160px]"
              :options="fields"
              hide-bottom-space
              :error="state.hasError"
            >
              <q-tooltip>
                指定要以哪一個欄位的資料作為分組依據
              </q-tooltip>
            </q-select>
          </template>
        </base-field>

        <base-field
          :value="groupQuantity"
          :validator="checkGroupQuantity"
        >
          <template #default="{ state }">
            <q-input
              v-model="groupQuantity"
              type="number"
              min="2"
              label="分組數量"
              filled
              bg-color="white"
              class="w-[100px]"
              hide-bottom-space
              :error="state.hasError"
            />
          </template>
        </base-field>

        <q-icon
          name="settings"
          size="2rem"
        >
          <q-menu>
            <q-list style="min-width: 100px">
              <!-- 代跑 -->
              <q-item clickable>
                <q-item-section>代跑設定</q-item-section>
                <q-item-section side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>

                <q-menu
                  anchor="top end"
                  self="top start"
                >
                  <q-list style="min-width: 100px">
                    <q-item clickable>
                      <q-item-section>
                        <q-toggle
                          v-model="enableSubstitute"
                          label="是否加入代跑"
                          color="lime"
                        />
                      </q-item-section>
                    </q-item>

                    <q-item clickable>
                      <q-item-section>
                        <q-input
                          v-model="substitutionCoefficient"
                          type="number"
                          label="代跑係數"
                          outlined
                        >
                          <q-tooltip>
                            可以調整代跑指定條件數值，例如：代跑速度可能會變慢，就可以把係數設定為大於 1 的數值
                          </q-tooltip>
                        </q-input>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>

              <!-- 演算法 -->
              <q-item clickable>
                <q-item-section>選用演算法</q-item-section>
                <q-item-section side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>

                <q-menu
                  anchor="top end"
                  self="top start"
                >
                  <q-list style="max-width: 500px">
                    <q-item
                      v-for="option in algorithmOptions"
                      :key="option.value"
                      tag="label"
                    >
                      <q-item-section
                        avatar
                        top
                      >
                        <q-radio
                          v-model="algorithm"
                          :val="option.value"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>
                          {{ option.label }}
                        </q-item-label>
                        <q-item-label caption>
                          {{ option.caption }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>
            </q-list>
          </q-menu>
        </q-icon>

        <q-separator
          vertical
          inset
          dark
        />

        <q-btn
          color="orange"
          unelevated
          @click="submitCreateGroups"
        >
          開始分組
        </q-btn>
      </q-card-section>

      <q-card-section class="flex-1 flex flex-nowrap overflow-x-auto gap-4">
        <q-card
          v-for="group in groups"
          :key="group.id"
          class=" flex flex-col flex-shrink-0 max-w-[300px]"
        >
          <q-card-section>
            <q-input
              v-model="group.name"
              filled
              label="組別名稱"
            />
          </q-card-section>

          <q-card-section class=" flex-fill-full-scroll">
            <draggable-area
              v-model="group.data"
              v-bind="getDragOptions('data')"
              :component-data="dragComponentData"
              class="flex flex-col gap-1"
              item-key="id"
            >
              <template #item="{ element: datum }: { element: TableDatum }">
                <div
                  :key="datum.id"
                  class="flex gap-[2px] bg-gray-100 p-1 rounded cursor-move"
                >
                  <span
                    v-for="(value, key) in datum"
                    :key="key"
                    class="p-[6px] px-[8px] text-xs tracking-wide text-white rounded duration-300
                 bg-gray-400 hover:bg-gray-600"
                  >
                    {{ key }}: {{ value }}
                  </span>
                </div>
              </template>
            </draggable-area>

            <div
              v-for="datum in group.substitutes"
              :key="datum.id"
              class="flex gap-[2px] bg-gray-100 p-1 rounded cursor-not-allowed"
            >
              <span
                v-for="(value, key) in datum"
                :key="key"
                class="p-[6px] px-[8px] text-xs tracking-wide text-white rounded duration-300
                 bg-orange-400 hover:bg-orange-600"
              >
                {{ key }}: {{ value }}
              </span>
            </div>
          </q-card-section>

          <q-card-section class=" bg-teal-6 text-white">
            <div>
              數量：{{ getGroupItemQuantity(group) }}
            </div>
            <div>
              總和：{{ getGroupTotal(group) }}
            </div>
            <div>
              平均值：{{ getGroupAvg(group) }}
            </div>
          </q-card-section>
        </q-card>
      </q-card-section>
    </base-form>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Decimal from 'decimal.js';
import { Group, TableDatum } from '../types/main.type';
import { cloneDeep, cond, constant, stubTrue } from 'lodash-es';
import { getNearestNumberIndex } from '../common/utils';
import { isOptional, isPositiveNumber } from '../common/validator';

import DraggableArea from 'vuedraggable';
import BaseForm from './base-form.vue';
import BaseField from './base-field.vue';

import { useMainStore } from '../stores/main.store';
import { useQuasar } from 'quasar';
import { useGrouper, AlgorithmType } from '../composables/use-grouper';

const emit = defineEmits<{
  (e: 'update', value: Group[]): void;
}>();

const store = useMainStore();
const $q = useQuasar();
const { getGroups } = useGrouper();

const conditionField = ref('');
const groupQuantity = ref(2);
const enableSubstitute = ref(true);
const substitutionCoefficient = ref(1);

const algorithm = ref<`${AlgorithmType}`>('limited-avg');
const algorithmOptions = [
  {
    value: 'avg',
    label: '平均分配演算法',
    caption: `將資料依條件排序後，在每次迭代中將最大數值分配至最小群組。
    速度最快，但是只能取得局部最佳解，每次計算結果會相同`,
  },
  {
    value: 'limited-avg',
    label: '有限分配演算法',
    caption: `基於平均分配演算法，但會在有限的次數內，持續求解並取最佳結果。
    每次計算結果會不同，可以多次嘗試。目前預設計算 5 萬次，電腦越好計算速度越快`,
  },
];

const fields = computed(() => {
  const item = store.data?.[0];

  if (!item) {
    return [];
  }

  return Object.keys(item);
});

const statisticalResult = computed(() => {
  const result: {
    quantity?: number,
    average?: number,
  } = {
    quantity: store.data?.length,
  }

  const condition = conditionField.value;

  const firstItem = store.data?.[0];
  if (!firstItem || !condition || !store.data) {
    return result;
  }

  if (!(condition in firstItem)) {
    return result;
  }

  const average = store.data.reduce((acc, datum) => {
    const result = acc.add(datum[condition]);
    return result;
  }, new Decimal(0));

  result.average = parseFloat(average.div(store.data.length).toFixed(2));

  return result;
});

const errorMessage = computed(() => {
  if (!conditionField.value) {
    return `請選擇條件`;
  }

  const firstItem = store.data?.[0];
  if (!firstItem) {
    return `資料不存在`;
  }

  const value = firstItem[conditionField.value];
  if (typeof value !== 'number') {
    return `條件欄位必須為數字`;
  }

  return undefined;
});

const groups = ref<Group[]>([]);


function getGroupAvg(group: Group) {
  const field = conditionField.value;
  if (!field) {
    return 0;
  }

  const list = [...group.data, ...group.substitutes];

  const result = list.reduce((acc, datum) => {
    const value = datum[field];
    if (typeof value === 'number') {
      return acc.add(value);
    }

    return acc;
  }, new Decimal(0));

  return result.div(list.length).toFixed(4);
}
function getGroupTotal(group: Group) {
  const field = conditionField.value;
  if (!field) {
    return 0;
  }

  const list = [...group.data, ...group.substitutes];

  const result = list.reduce((acc, datum) => {
    const value = datum[field];
    if (typeof value === 'number') {
      return acc.add(value);
    }

    return acc;
  }, new Decimal(0));

  return result.toFixed(4);
}
function getGroupItemQuantity(group: Group) {
  return group.data.length + group.substitutes.length;
}

/** 找出變成代跑時最接近總平均的人 */
function getSubstitutionDatum(group: Group) {
  if (!statisticalResult.value.quantity ||
    !statisticalResult.value.average) {
    return undefined;
  }

  const max = statisticalResult.value.quantity / groupQuantity.value;
  if (group.data.length >= max) {
    return undefined;
  }

  const field = conditionField.value;
  if (!field) {
    return undefined;
  }

  // 計算全部群組內每個代跑最後的總平均
  const avgData = group.data.map((datum) => {
    const newDatum = {
      ...datum,
      [field]: Number(datum[field]) * substitutionCoefficient.value,
    }

    const newList = [...group.data, newDatum];

    const sum = newList.reduce((acc, item) => {
      const value = item[field];
      if (typeof value === 'number') {
        return acc.add(value);
      }

      return acc;
    }, new Decimal(0));

    return sum.div(newList.length).toNumber();
  });

  const nearestIndex = getNearestNumberIndex(avgData, statisticalResult.value.average);
  const target = cloneDeep(group.data[nearestIndex]);
  return target;
}

async function submitCreateGroups() {
  if (!store.data) {
    $q.notify({
      type: 'negative', message: '無資料'
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

  if (errorMessage.value) {
    $q.notify({
      type: 'negative', message: errorMessage.value
    });
    return;
  }

  const startedAt = new Date().valueOf();
  $q.loading.show({ message: '努力計算中，請稍後...' });
  const result = await getGroups(store.data, conditionField.value, groupQuantity.value, {
    algorithm: algorithm.value
  });
  $q.loading.hide();

  if (enableSubstitute.value) {
    result.forEach((group) => {
      const substitute = getSubstitutionDatum(group);
      if (substitute) {
        group.substitutes.push(substitute);
      }
    });
  }

  // 預設依照名稱排序
  result.sort((a, b) => Number(a.name) - Number(b.name));

  emit('update', result)
  groups.value = result;

  const calcTime = new Date().valueOf() - startedAt;
  $q.notify({
    type: 'positive', message: `計算完成，耗時 ${calcTime}ms`,
  });
}


const dragComponentData = ref({
  tag: 'div',
  type: 'transition-group',
  name: 'list'
});

function getDragOptions(group: number | string) {
  return {
    animation: 200,
    group,
    disabled: false,
  }
}


const baseForm = ref<InstanceType<typeof BaseForm>>();
const checkNotEmpty = cond([
  [isOptional, constant('不可為空')],
  [stubTrue, constant(undefined)],
]);

function isGreaterThanOne(value: number) {
  return Number(value) > 1;
}

const checkGroupQuantity = cond([
  [isOptional, constant('不可為空')],
  [isPositiveNumber, constant(undefined)],
  [isGreaterThanOne, constant(undefined)],
  [stubTrue, constant('必須為大於 1 之整數')],
]);

</script>

<style scoped lang="sass">
</style>
