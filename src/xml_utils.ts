export function xmlToArray(data: any) {
  if (data === undefined) {
    return undefined;
  } else if (data.length) { // input data is an Array
    return data;
  } else {
    return [data];
  }
}