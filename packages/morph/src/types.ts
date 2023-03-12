import {Type} from "ts-morph";

export function handleType(t: Type) {
  const text = t.getText();
  const name = t.getSymbol()?.getName();
  const arrayType = t.getArrayElementType()?.getSymbol()?.getName();
/*
  console.dir(text);
  console.dir(name);
*/
  if (t.isEnum() === true) {
    return "i";
  }

  switch (text) {
    case "string[]":
      return "string_table";
    case "number":
      return "i";
    case "boolean":
      return "abap_bool";
    case "{ [name: string]: boolean; }":
      return "STANDARD TABLE OF string WITH EMPTY KEY";
    default:
      if (arrayType) {
        return "STANDARD TABLE OF REF TO " + arrayType + " WITH EMPTY KEY";
      } else if (name === "__type") {
        return text;
      } else if (name) {
        return "REF TO " + name;
      }
      return text;
  }
}