import mergeWith from 'lodash.mergewith';

export const merge = mergeWith;
export const mergeCustomizer = (_object: any, srcVal: any) => {
  if (Array.isArray(srcVal)) {
    return srcVal;
  }
};
