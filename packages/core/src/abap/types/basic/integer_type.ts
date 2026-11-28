import {AbstractType, AbstractTypeData} from "./_abstract_type";

/** byte size of the integer: 1 for DDIC INT1 (internal type b), 2 for INT2 (s), 4 for INT4 and ABAP i */
export type IntegerBytes = 1 | 2 | 4;

export class IntegerType extends AbstractType {
  private static readonly singletons = new Map<string, IntegerType>();
  private readonly bytes: IntegerBytes;

  public static get(input?: AbstractTypeData, bytes: IntegerBytes = 4): IntegerType {
    const key = JSON.stringify(input) + (bytes === 4 ? "" : "#" + bytes);
    if (this.singletons.has(key)) {
      return this.singletons.get(key)!;
    }

    const ret = new IntegerType(input, bytes);
    this.singletons.set(key, ret);
    return ret;
  }

  private constructor(input?: AbstractTypeData, bytes: IntegerBytes = 4) {
    super(input);
    this.bytes = bytes;
  }

  /** 1 for DDIC INT1, 2 for INT2, 4 for INT4 and ABAP type i */
  public getBytes(): IntegerBytes {
    return this.bytes;
  }

  /** fully qualified symbolic name of the type */
  public getQualifiedName(): string | undefined {
    const qual = this.data?.qualifiedName;
    if (qual === undefined) {
      return "I";
    }
    return qual;
  }

  public toText() {
    switch (this.bytes) {
      case 1:
        return "```b```";
      case 2:
        return "```s```";
      default:
        return "```i```";
    }
  }

  public isGeneric() {
    return false;
  }

  // b and s cannot be declared in ABAP source, i is the closest declarable type
  public toABAP(): string {
    return "i";
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    switch (this.bytes) {
      case 1:
        return "abap.int1";
      case 2:
        return "abap.int2";
      default:
        return "abap.int4";
    }
  }
}
