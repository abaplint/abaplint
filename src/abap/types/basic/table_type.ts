import {AbstractType} from "./_abstract_type";

export class TableType implements AbstractType {
  private readonly rowType: AbstractType;

// todo: add header indicator
// todo: add keys
  public constructor(rowType: AbstractType) {
    this.rowType = rowType;
  }

  public getRowType(): AbstractType {
    return this.rowType;
  }

  public toText() {
    return "Table of: " + this.rowType.toText();
  }

  public isGeneric() {
    return false;
  }
}