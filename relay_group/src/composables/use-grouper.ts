import { useWebWorkerFn } from '@vueuse/core';
import Decimal from 'decimal.js';
import { chunk, cloneDeep, omit } from 'lodash-es';
import { nanoid } from 'nanoid';
import { ref } from 'vue'
import { Group, TableDatum } from '../types/main.type';

export enum AlgorithmType {
  AVG = 'avg',
  LIMITED_AVG = 'limited-avg',
}

interface GetGroupsOptions {
  algorithm: `${AlgorithmType}`;
}

export function useGrouper() {
  function createGroups(quantity: number): Group[] {
    const groups = [];
    for (let i = 0; i < quantity; i++) {
      groups.push({
        id: nanoid(), name: `${i + 1}`, data: [], substitutes: [],
      });
    }

    return groups;
  }

  async function getGroups(list: TableDatum[], field: string, quantity: number, options: GetGroupsOptions) {
    const { algorithm } = options;

    const groups = createGroups(quantity);

    switch (algorithm) {
      case 'limited-avg': {
        return await useLimitedDistributionAlgorithm(groups, list, field);
      }
      default: {
        return await useAverageDistributionAlgorithm(groups, list, field);
      }
    }
  }

  /** 將資料依大小排序後，依序加入資料，每次都將最大的群組放入最小的資料
   */
  async function useAverageDistributionAlgorithm(groups: Group[], list: TableDatum[], field: string) {
    const calcGroups = groups.map((group) => ({
      group, value: 0,
    }));

    const sortedList = cloneDeep(list).sort((a, b) => Number(a[field]) - Number(b[field]));
    const chunkList = chunk(sortedList, groups.length);

    chunkList.forEach((chunk) => {
      const sortedCalcGroups = calcGroups.sort((a, b) => b.value - a.value);
      sortedCalcGroups.forEach((calcGroup, index) => {
        const datum = chunk[index];
        if (!datum) return;

        calcGroup.group.data.push(datum);
        calcGroup.value += Number(datum[field]);
      });
    });

    return calcGroups.map(({ group }) => group);
  }

  /** 有限平均分配，在有限時間內嘗試最佳組合
   */
  async function useLimitedDistributionAlgorithm(groups: Group[], list: TableDatum[], field: string, iterations = 50000) {
    const { workerFn } = useWebWorkerFn((
      { groups, list, field, iterations }: { groups: Group[], list: TableDatum[], field: string, iterations: number }
    ) => {
      const totalAvg = getAvg(list, field);

      /** 取得隨機排序之平均分配群組 */
      function getRandomDistributionGroup(groups: Group[], list: TableDatum[], field: string): Group[] {
        const calcGroups = groups.map((group) => ({
          group: cloneDeep(group),
          value: 0,
        }));

        const sortedList = shuffle<TableDatum>(cloneDeep(list));
        const chunkList = chunk(sortedList, groups.length);

        chunkList.forEach((chunk) => {
          const sortedChunk = chunk.sort((a, b) => Number(a[field]) - Number(b[field]));
          const sortedCalcGroups = calcGroups.sort((a, b) => b.value - a.value);

          sortedCalcGroups.forEach((calcGroup, index) => {
            const datum = sortedChunk[index];
            if (!datum) return;

            calcGroup.group.data.push(datum);
            calcGroup.value += Number(datum[field]);
          });
        });

        return calcGroups.map(({ group }) => group);
      }

      /** 取得 group 平均值 */
      function getGroupAvg(group: Group) {
        const list = [...group.data, ...group.substitutes];

        return getAvg(list, field);
      }

      /** 判斷新群組結果有沒有比較好 */
      function comparingResults(oriGroups: Group[], newGroups: Group[]) {
        const oriDelta = oriGroups.reduce((acc, group) => {
          acc += Math.abs(getGroupAvg(group) - totalAvg);
          return acc;
        }, 0);

        const newDelta = newGroups.reduce((acc, group) => {
          acc += Math.abs(getGroupAvg(group) - totalAvg);
          return acc;
        }, 0);

        return {
          isBetter: newDelta < oriDelta,
          isBest: newDelta === 0,
        }
      }

      function shuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
      }
      function cloneDeep(obj: any) {
        return JSON.parse(JSON.stringify(obj));
      }
      function chunk<T>(array: T[], size: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
          result.push(array.slice(i, i + size));
        }

        return result;
      }
      function getAvg<T>(list: T[], field: keyof T) {
        const result = list.reduce((acc, datum) => {
          const value = datum[field];
          if (typeof value === 'number') {
            acc += value;
          }

          return acc;
        }, 0);

        return result / list.length;
      }

      let result = getRandomDistributionGroup(groups, list, field);
      let counter = 0;

      /** 在指定次數內不斷嘗試 */
      do {
        const currentResult = getRandomDistributionGroup(groups, list, field);

        const { isBest, isBetter } = comparingResults(result, currentResult);

        if (isBest) {
          return currentResult;
        }

        if (isBetter) {
          result = currentResult;
        }

        counter++;
      } while (counter < iterations);

      return result;
    });

    const result = await workerFn(JSON.parse(JSON.stringify({ groups, list, field, iterations })));
    result.forEach((group) => group.data.sort((a, b) => Number(a[field]) - Number(b[field])));

    return result;
  }

  return {
    getGroups,
  }
}