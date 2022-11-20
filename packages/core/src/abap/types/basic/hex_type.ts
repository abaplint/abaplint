import {AbstractType} from "./_abstract_type";

export class HexType extends AbstractType {
  private readonly length: number;

  public constructor(length: number, qualifiedName?: string) {
    super({qualifiedName: qualifiedName});
    if (length <= 0) {
      throw new Error("Bad LENGTH");
    }
    this.length = length;
  }

  public getLength() {
    return this.length;
  }

  public toText() {
    return "```x LENGTH " + this.getLength() + "```";
  }

  public toABAP(): string {
    return "x LENGTH " + this.getLength();
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.raw( " + this.getLength() + " )";
  }
}