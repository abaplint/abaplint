import {AbstractType} from "./_abstract_type";

export class HexType extends AbstractType {
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
    return "x LENGTH " + this.getLength();
  }

}