import {AbstractType} from "./_abstract_type";

export class UnknownType extends AbstractType {
  private readonly error: string;

  public constructor(error: string, qualifiedName?: string) {
    super(qualifiedName);
    this.error = error;
  }

  public getError() {
    return this.error;
  }

  public toText() {
    return "Unknown type: " + this.error;
  }

  public toABAP(): string {
    throw new Error("unknown, generic: " + this.error);
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.TODO_UNKNOWN";
  }
}