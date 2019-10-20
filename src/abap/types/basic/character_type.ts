import {BasicType} from "./_basic_type";

export class CharacterType extends BasicType {
  private readonly length: number;

  public constructor(length: number) {
    super();
    this.length = length;
  }

  public getLength() {
    return this.length;
  }

}