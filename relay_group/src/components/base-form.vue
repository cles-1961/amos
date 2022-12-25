<template>
  <slot />
</template>

<script lang="ts">
export const PROVIDE_KEY = 'base-form';

export interface ProvideFunctions {
  bindItem: (item: FormCtrlItem) => void;
  unbindItem: (id: string) => void;
}

export interface FormCtrlItem {
  id: string;
  focus?: () => void;
  blur?: () => void;
  resetValidation?: () => void;
  validate?: () => Promise<void>;
  errorMessage?: ComputedRef<string | undefined>;
}
</script>

<script setup lang="ts">
import { computed, ComputedRef, provide, ref, watch } from 'vue';

const componentMap = new Map<string, FormCtrlItem>();
const components = computed(() => {
  const items = [...componentMap].map(([id, item]) => item);
  return items;
});

const emit = defineEmits<{
  (e: 'submit'): void;
}>();

function bindItem(item: FormCtrlItem) {
  componentMap.set(item.id, item);
}
function unbindItem(id: string) {
  componentMap.delete(id);
}
provide(PROVIDE_KEY, {
  bindItem,
  unbindItem,
});

async function validate() {
  for (const item of components.value) {
    if (!item?.validate) continue;
    await item?.validate();
  }
}

const errorMessages = computed(() => {
  return components.value.map(({ errorMessage }) => errorMessage);
});

defineExpose({
  /** 驗證所有組件 */
  validate,
  /** 所有錯誤訊息 */
  errorMessages,
});
</script>