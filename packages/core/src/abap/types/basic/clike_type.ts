import {AbstractType} from "./_abstract_type";

export class CLikeType extends AbstractType {
  private static readonly singleton = new CLikeType();

  public static get(): CLikeType {
    return this.singleton;
  }

  private constructor() {
    super();
  }

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

  public toCDS() {
    return "abap.TODO_CLIKE";
  }
}