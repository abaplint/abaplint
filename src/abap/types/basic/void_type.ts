import {AbstractType} from "./_abstract_type";

export class VoidType extends AbstractType {
  public toText() {
    return "Void type, ok";
  }

  public isGeneric() {
    return false;
  }
}