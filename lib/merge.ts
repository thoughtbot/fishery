import mergeWith from 'lodash.mergewith';

export const merge = mergeWith;
export const mergeCustomizer = (
  objValue: any,
  srcVal: any,
  key: string,
  object: any,
) => {
  if (Array.isArray(srcVal) || ArrayBuffer.isView(srcVal)) {
    // don't try to merge arrays or subclasses of TypedArray
    // ArrayBuffer.isView() matches Buffer, Uint8Array, Float32Array, etc.
    return srcVal;
  } else if (srcVal === undefined) {
    object[key] = srcVal;
  }
};
