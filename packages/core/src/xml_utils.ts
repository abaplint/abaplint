export function xmlToArray(data: any): any[] {
  if (data === undefined) {
    return [];
  } else if (data.length) { // input data is an Array
    return data;
  } else {
    return [data];
  }
}