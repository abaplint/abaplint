import {Type} from "ts-morph";

export function handleType(t: Type) {
  const text = t.getText();
  const name = t.getSymbol()?.getName();
  const arrayType = t.getArrayElementType()?.getSymbol()?.getName();

  switch (text) {
    case "string[]":
      return "string_table";
    case "number":
      return "i";
    case "boolean":
      return "abap_bool";
    default:
      if (arrayType) {
        return "STANDARD TABLE OF REF TO " + arrayType + " WITH EMPTY KEY";
      } else if (name) {
        return "REF TO " + name;
      }
      return text;
  }
}