import {AbstractType} from "./_abstract_type";

export class CLikeType implements AbstractType {
  public toText() {
    return "```clike```";
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