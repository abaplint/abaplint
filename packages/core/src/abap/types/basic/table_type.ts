import {AbstractType} from "./_abstract_type";

// todo: add keys and table type

export class TableType extends AbstractType {
  private readonly rowType: AbstractType;
  private readonly withHeader: boolean;

  public constructor(rowType: AbstractType, withHeader: boolean, qualifiedName?: string) {
    super(qualifiedName);
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
// this is used for downport, so use default key for now
    return "STANDARD TABLE OF " + this.rowType.toABAP() + " WITH DEFAULT KEY";
  }

  public toText(level: number) {
    const type = this.rowType;

    if (this.withHeader === true) {
      return "Table with header of " + type.toText(level + 1);
    } else {
      return "Table of " + type.toText(level + 1);
    }
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return this.rowType.containsVoid();
  }
}