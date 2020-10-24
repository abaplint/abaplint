import {AbstractType} from "./_abstract_type";

export class UnknownType extends AbstractType {
  private readonly error: string;

  public constructor(error: string, name?: string) {
    super(name);
    this.error = error;
  }

  public getError() {
    return this.error;
  }

  public toText() {
    return "Unknown type: " + this.error;
  }

  public toABAP(): string {
    throw new Error("unknown, generic");
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return false;
  }
}