
import { isNil } from 'lodash-es';

/** 數值是否大於零正整數 */
export function isPositiveNumber(value: any) {
  return /^\d*[1-9]\d*$/.test(`${value}`);
}

/**
 * 數值是否為 `null`、`undefined` 或 `''`
 */
export function isOptional(value: any) {
  return isNil(value) || value === '';
}
