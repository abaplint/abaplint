import {AbstractType} from "./_abstract_type";

export class DecFloat16Type implements AbstractType {
  public toText() {
    return "```decfloat16```";
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return false;
  }
}