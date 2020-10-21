import {AbstractType} from "./_abstract_type";

export class DecFloat34Type implements AbstractType {
  public toText() {
    return "```decfloat34```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "decfloat34";
  }

  public containsVoid() {
    return false;
  }
}