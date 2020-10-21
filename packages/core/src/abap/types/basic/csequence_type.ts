import {AbstractType} from "./_abstract_type";

export class CSequenceType implements AbstractType {
  public toText() {
    return "```csequence```";
  }

  public isGeneric() {
    return true;
  }

  public toABAP(): string {
    throw new Error("csequence, generic");
  }

  public containsVoid() {
    return false;
  }
}