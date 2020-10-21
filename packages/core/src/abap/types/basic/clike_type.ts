import {AbstractType} from "./_abstract_type";

export class CLikeType implements AbstractType {
  public toText() {
    return "```clike```";
  }

  public isGeneric() {
    return true;
  }

  public toABAP(): string {
    throw new Error("clike, generic");
  }

  public containsVoid() {
    return false;
  }
}