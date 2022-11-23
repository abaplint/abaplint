import {Type} from "ts-morph";

export function handleType(t: Type) {
  const text = t.getText();
  switch (text) {
    case "number":
      return "i";
    case "boolean":
      return "abap_bool";
    default:
      return text;
  }
}