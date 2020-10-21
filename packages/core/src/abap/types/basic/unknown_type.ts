import {AbstractType} from "./_abstract_type";

export class UnknownType implements AbstractType {
  private readonly error: string;

  public constructor(error: string) {
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