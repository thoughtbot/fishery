import mergeWith from 'lodash.mergewith';

export const merge = mergeWith;
export const mergeCustomizer = (
  objValue: any,
  srcVal: any,
  key: string,
  object: any,
) => {
  if (Array.isArray(srcVal) || ArrayBuffer.isView(srcVal)) {
    return srcVal;
  } else if (srcVal === undefined) {
    object[key] = srcVal;
  }
};
