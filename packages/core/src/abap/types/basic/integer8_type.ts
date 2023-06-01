import {AbstractType} from "./_abstract_type";

export class Integer8Type extends AbstractType {
  public toText() {
    return "```int8```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "int8";
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.int8";
  }
}