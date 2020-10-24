import {AbstractType} from "./_abstract_type";

export class AnyType extends AbstractType {
  public toText() {
    return "```any```";
  }

  public toABAP() {
    return "any";
  }

  public isGeneric() {
    return true;
  }

  public containsVoid() {
    return false;
  }
}