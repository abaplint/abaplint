import {AbstractType} from "./_abstract_type";

export class DecFloatType extends AbstractType {
  public toText() {
    return "```decfloat```";
  }

  public isGeneric() {
    return true;
  }

  public toABAP(): string {
    return "decfloat";
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.fltp";
  }
}