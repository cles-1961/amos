import { defineStore } from 'pinia';
import { TableDatum } from '../types/main.type';

interface State {
  data?: TableDatum[];
}

export const useMainStore = defineStore('main', {
  state: (): State => ({
    data: undefined
  }),
  actions: {
    setData(data: TableDatum[]) {
      this.data = data;
    },
  }
})