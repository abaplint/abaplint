import {BasicType} from "./_basic_type";

export class CharacterType extends BasicType {
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
    return "TYPE c LENGTH " + this.getLength();
  }

}