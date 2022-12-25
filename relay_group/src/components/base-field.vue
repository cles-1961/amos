<template>
  <div>
    <q-field
      ref="field"
      v-intersection="handleIntersection"
      borderless
      :error="errorVisible"
      hide-bottom-space
      no-error-icon
      @blur="handleBlur"
      @focus="handleFocus"
      @change="handleChange"
    >
      <template #control>
        <slot :state="state" />
      </template>
    </q-field>

    <q-tooltip
      :model-value="errorVisible"
      no-parent-event
      :anchor="errorTooltip.anchor"
      :self="errorTooltip.self"
      :transition-show="errorTooltip.transitionShow"
      :transition-hide="errorTooltip.transitionHide"
      :class="{ 'opacity-0': !inViewport }"
    >
      {{ errorMessage }}
    </q-tooltip>
  </div>
</template>

<script setup lang="ts">
import { QField, QTooltipProps } from 'quasar';
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { defaults } from 'lodash-es';
import { nanoid } from 'nanoid';
import { watchThrottled } from '@vueuse/core';
import { ProvideFunctions, PROVIDE_KEY } from './base-form.vue';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  /** 驗證器
   * 
   * blur、input 時會自動呼叫此 function，回傳 string 表示錯誤訊息
   */
  validator?: (value: Props['value']) => string | undefined |
    Promise<string | undefined>;

  errorTooltip?: {
    anchor?: QTooltipProps['anchor'];
    self?: QTooltipProps['self'];
    transitionShow?: string;
    transitionHide?: string;
  };
}

const errorTooltipDefault: Props['errorTooltip'] = {
  anchor: 'top middle',
  self: 'top middle',
  transitionShow: 'jump-right',
  transitionHide: 'jump-left',
}

const props = withDefaults(defineProps<Props>(), {
  validator: undefined,
  errorTooltip: () => ({}),
});

const emit = defineEmits<{
  (e: 'focus'): void;
  (e: 'blur'): void;
  (e: 'input'): void;
  (e: 'change'): void;
}>();

const id = nanoid();
const field = ref<InstanceType<typeof QField>>();

const inViewport = ref(false);
function handleIntersection(entry: { isIntersecting: boolean }) {
  inViewport.value = entry.isIntersecting
}

const errorVisible = ref(false);
const errorMessage = ref<string>();
const errorTooltip = computed(() =>
  defaults(props.errorTooltip, errorTooltipDefault)
);
const exposeErrorMessage = computed(() => {
  if (!errorVisible.value) {
    return undefined;
  }

  return errorMessage.value;
})

function handleBlur() {
  emit('blur');
  callValidator();
}
function handleChange() {
  emit('change');
}
function handleFocus() {
  emit('focus');
}

watchThrottled(
  () => props.value,
  () => callValidator(),
  { throttle: 500 },
)

async function callValidator() {
  if (!props.validator) return;

  const validator = props.validator(props.value);

  if (validator instanceof Promise) {
    const message = await validator;
    if (message) {
      errorMessage.value = message;
    }
    errorVisible.value = !!message;
    return;
  }

  const message = validator;
  if (message) {
    errorMessage.value = message;
  }
  errorVisible.value = !!message;
}

const state = computed(() => ({
  hasError: !!exposeErrorMessage.value
}));

const form = inject<ProvideFunctions>(PROVIDE_KEY);
const exposeFunctions = {
  focus: field.value?.focus,
  blur: field.value?.blur,
  /** 重置驗證 */
  resetValidation: field.value?.resetValidation,
  /** 開始驗證 */
  validate() {
    return callValidator();
  },
  /** 錯誤訊息，無錯誤則為 undefined */
  errorMessage: exposeErrorMessage
}

onMounted(() => {
  form?.bindItem({
    id,
    ...exposeFunctions,
  });
});
onBeforeUnmount(() => {
  form?.unbindItem(id);
});

defineExpose(exposeFunctions);
</script>

<style lang="sass" scoped>
::v-deep(.q-field__native:has(label))
  padding: 0px
</style>