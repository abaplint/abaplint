import {Type} from "ts-morph";

export function handleType(t: Type) {
  const text = t.getText();
  const name = t.getSymbol()?.getName();
  switch (text) {
    case "string[]":
      return "string_table";
    case "number":
      return "i";
    case "boolean":
      return "abap_bool";
    default:
      if (name) {
        return "REF TO " + name;
      }
      return text;
  }
}