import {AbstractType} from "./_abstract_type";

// this is the ABAP "F" type, which is IEEE?
// todo, same as FloatingPointType ?

export class FloatType implements AbstractType {
  public toText() {
    return "```f```";
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return false;
  }

  public getIdentifier() {
    return undefined;
  }
}