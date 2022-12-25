import Decimal from "decimal.js";
import { cloneDeep } from "lodash-es";

export function getNearestNumber(values: number[], target: number) {
  const list = [...values].sort((a, b) => b - a);

  const closest = list.reduce((prev, number) =>
    (Math.abs(number - target) < Math.abs(prev - target) ? number : prev)
  );

  return closest;
}

export function getNearestNumberIndex(values: number[], target: number) {
  const list = [...values].sort((a, b) => b - a);

  const closest = list.reduce((prev, number) =>
    (Math.abs(number - target) < Math.abs(prev - target) ? number : prev)
  );

  return values.indexOf(closest);
}

export function removeItem<T>(list: T[], indexes: number[]) {
  const sortedIndexes = [...indexes].sort();

  const result = sortedIndexes.reduceRight((result, targetIndex) => {
    result.splice(targetIndex, 1);
    return result;
  }, [...list]);

  return result;
}

export function getAvg<T>(list: T[], field: keyof T) {
  const result = list.reduce((acc, datum) => {
    const value = datum[field];
    if (typeof value === 'number') {
      return acc.add(value);
    }

    return acc;
  }, new Decimal(0));

  return result.div(list.length).toNumber();
}
