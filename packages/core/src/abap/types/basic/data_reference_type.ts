import {AbstractType} from "./_abstract_type";

export class DataReference extends AbstractType {
  private readonly type: AbstractType;

  public constructor(type: AbstractType, qualifiedName?: string) {
    super({qualifiedName: qualifiedName});
    this.type = type;
  }

  public toText(level: number) {
    return "Data REF TO " + this.type.toText(level + 1);
  }

  public getType(): AbstractType {
    return this.type;
  }

  public toABAP(): string {
    const type = this.type.toABAP();
    if (type.includes(" TABLE OF ")) {
      return ""; // hmm, should this return undefined?
    }
    return "REF TO " + this.type.toABAP();
  }

  public isGeneric() {
    // a DATA definition can be "REF TO data", so its not generic
    return false;
  }

  public containsVoid() {
    return this.type.containsVoid();
  }

  public toCDS() {
    return "abap.TODO_REFERENCE";
  }
}