import {AbstractType} from "./_abstract_type";

export class DecFloat16Type implements AbstractType {
  public toText() {
    return "```decfloat16```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "decfloat16";
  }

  public containsVoid() {
    return false;
  }
}