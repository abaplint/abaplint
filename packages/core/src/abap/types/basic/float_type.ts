import {AbstractType} from "./_abstract_type";

// this is the ABAP "F" type, which is IEEE?
// todo, same as FloatingPointType ?

export class FloatType extends AbstractType {
  public toText() {
    return "```f```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "f";
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.fltp";
  }
}