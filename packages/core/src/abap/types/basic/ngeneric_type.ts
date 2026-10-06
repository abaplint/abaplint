import {NumericType} from "./numeric_type";

// "TYPE n" of a method or FORM parameter, where no length can be given.
// It is a NumericType, so everything that handles n keeps treating it as such
export class NGenericType extends NumericType {
  private static readonly singleton = new NGenericType();

  public static get(): NGenericType {
    return this.singleton;
  }

  private constructor() {
    super(1);
  }

  public toText() {
    return "```n```";
  }

  public isGeneric() {
    return true;
  }
}
