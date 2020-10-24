import {AbstractType} from "./_abstract_type";

export class NumericType extends AbstractType {
  private readonly length: number;

  public constructor(length: number, name?: string) {
    super(name);
    if (length <= 0) {
      throw new Error("Bad LENGTH");
    }
    this.length = length;
  }

  public getLength() {
    return this.length;
  }

  public toText() {
    return "```n LENGTH " + this.getLength() + "```";
  }

  public toABAP(): string {
    return "n LENGTH " + this.getLength();
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return false;
  }
}