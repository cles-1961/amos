import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import App from '../App.vue'

describe('App 入口組件', () => {
  describe('測試基本內容', () => {
    it('是否包含 codfish 文字', () => {
      const wrapper = mount(App, {
        global: {
          plugins: [
            createTestingPinia({
              stubActions: false,
            }),
          ],
        },
      });

      expect(wrapper.text()).toContain('codfish');
    })
  })
})