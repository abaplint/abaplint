import {AbstractType} from "./_abstract_type";

export class TableType extends AbstractType {
  private readonly rowType: AbstractType;
  private readonly withHeader: boolean;

// todo: add keys
  public constructor(rowType: AbstractType, withHeader: boolean, name?: string) {
    super(name);
    this.rowType = rowType;
    this.withHeader = withHeader;
  }

  public isWithHeader(): boolean {
    return this.withHeader;
  }

  public getRowType(): AbstractType {
    return this.rowType;
  }

  public toABAP(): string {
    return "TableTypetoABAPtodo";
  }

  public toText(level: number) {
    let extra = "";
    const type = this.rowType;

    if (type.getName()) {
      extra = "\n\nType name: \"" + type.getName() + "\"";
    }

    if (this.withHeader === true) {
      return "Table with header of " + type.toText(level + 1) + extra;
    } else {
      return "Table of " + type.toText(level + 1) + extra;
    }
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return this.rowType.containsVoid();
  }
}