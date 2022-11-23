import {Type} from "ts-morph";

export function handleType(t: Type) {
  const text = t.getText();
  switch (text) {
    case "string[]":
      return "string_table";
    case "number":
      return "i";
    case "boolean":
      return "abap_bool";
    default:
      return text;
  }
}