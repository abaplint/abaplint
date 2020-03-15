import {AbstractType} from "./_abstract_type";

export class CLikeType extends AbstractType {
  public toText() {
    return "```clike```";
  }

  public isGeneric() {
    return true;
  }
}