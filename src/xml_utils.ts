export function xmlToArray(data: any) {
  if (data.constructur === Array) {
    return data;
  } else {
    return [data];
  }
}