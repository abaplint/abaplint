import {AbstractType} from "./_abstract_type";

export class VoidType extends AbstractType {
  private static readonly singletons = new Map<string, VoidType>();

  public static get(voided: string | undefined, qualifiedName?: string): VoidType {
    const key = JSON.stringify({voided, qualifiedName});
    if (this.singletons.has(key)) {
      return this.singletons.get(key)!;
    }

    const ret = new VoidType(voided, qualifiedName);
    this.singletons.set(key, ret);
    return ret;
  }

  // this contains the name of the type that was the original reason for the void
  private readonly voided: string | undefined;

  private constructor(voided: string | undefined, qualifiedName?: string) {
    super({qualifiedName: qualifiedName});
    this.voided = voided;
  }

  public getVoided(): string | undefined {
    return this.voided;
  }

  public toABAP(): string {
    return this.voided || "VOIDEDtoABAP";
  }

  public toText() {
    return "Void(" + this.voided + ")";
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return true;
  }

  public toCDS() {
    return "abap.TODO_VOID";
  }
}