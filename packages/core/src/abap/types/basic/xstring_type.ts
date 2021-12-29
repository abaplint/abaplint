import {AbstractType} from "./_abstract_type";

export class XStringType extends AbstractType {

  public toText() {
    return "```xstring```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "xstring";
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.rawstring";
  }
}