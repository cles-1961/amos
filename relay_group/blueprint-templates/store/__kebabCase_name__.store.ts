import { defineStore } from 'pinia';

interface State {
  data: string;
}

export const use{{pascalCase name}}Store = defineStore('{{kebabCase name}}', {
  state: (): State => ({
    data: 'codfish'
  })
})