export function xmlToArray(data: any) {
  if (data.length) { // input data is an Array
    return data;
  } else {
    return [data];
  }
}