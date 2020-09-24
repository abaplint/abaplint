import {AbstractType} from "./_abstract_type";

export class CSequenceType implements AbstractType {
  public toText() {
    return "```csequence```";
  }

  public isGeneric() {
    return true;
  }

  public containsVoid() {
    return false;
  }

  public getIdentifier() {
    return undefined;
  }
}