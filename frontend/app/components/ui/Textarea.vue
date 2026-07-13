<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-sm font-medium text-slate-700 mb-1.5">
      {{ label }}
    </label>
    <div class="relative">
      <textarea
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :rows="rows"
        :class="[
          'block w-full rounded-lg sm:text-sm transition-colors duration-200 outline-none',
          'px-3 py-2.5',
          error 
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500 border',
          disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-white shadow-sm'
        ]"
      ></textarea>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="helpText" class="mt-1 text-sm text-slate-500">{{ helpText }}</p>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 4
  }
})

defineEmits(['update:modelValue'])

const id = useId()
</script>
