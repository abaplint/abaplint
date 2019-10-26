import {AbstractType} from "./_abstract_type";

export class NumericType extends AbstractType {
  private readonly length: number;

  public constructor(length: number) {
    if (length <= 0) {
      throw new Error("Bad LENGTH");
    }
    super();
    this.length = length;
  }

  public getLength() {
    return this.length;
  }

  public toText() {
    return "n LENGTH " + this.getLength();
  }

}