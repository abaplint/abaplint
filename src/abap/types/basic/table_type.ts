import {AbstractType} from "./_abstract_type";

export class TableType extends AbstractType {
  private readonly rowType: AbstractType;

// todo: add header indicator
// todo: add keys
  public constructor(rowType: AbstractType) {
    super();
    this.rowType = rowType;
  }

  public getRowType(): AbstractType {
    return this.rowType;
  }

  public toText() {
    return "TABLE OF: " + this.rowType.toText();
  }
}