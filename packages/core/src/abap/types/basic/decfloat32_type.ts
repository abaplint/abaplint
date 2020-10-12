import {AbstractType} from "./_abstract_type";

export class DecFloat32Type implements AbstractType {
  public toText() {
    return "```decfloat32```";
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return false;
  }
}