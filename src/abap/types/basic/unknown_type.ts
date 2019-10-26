import {AbstractType} from "./_abstract_type";

export class UnknownType extends AbstractType {
  private readonly error: string;

  public constructor(error: string) {
    super();
    this.error = error;
  }

  public getError() {
    return this.error;
  }

  public toText() {
    return "Unknown type, error: " + this.error;
  }
}