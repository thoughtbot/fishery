import mergeWith from 'lodash.mergewith';

export const merge = mergeWith;
export const mergeCustomizer = (
  _object: any,
  srcVal: any,
  key: 'string',
  object: any,
) => {
  if (Array.isArray(srcVal)) {
    return srcVal;
  } else if (srcVal === undefined && _object) {
    object[key] = srcVal;
  }
};
