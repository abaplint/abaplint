import {TypedIdentifier} from "../_typed_identifier";
import {AbstractType} from "./_abstract_type";

export class TableType implements AbstractType {
  private readonly rowType: TypedIdentifier | AbstractType;
  private readonly withHeader: boolean;

// todo: add keys
  public constructor(rowType: TypedIdentifier | AbstractType, withHeader: boolean) {
    this.rowType = rowType;
    this.withHeader = withHeader;
  }

  public isWithHeader(): boolean {
    return this.withHeader;
  }

  public getRowType(): AbstractType {
    if (this.rowType instanceof TypedIdentifier) {
      return this.rowType.getType();
    } else {
      return this.rowType;
    }
  }

  public toText(level: number) {
    if (this.withHeader === true) {
      return "Table with header of " + this.rowType.toText(level + 1);
    } else {
      return "Table of " + this.rowType.toText(level + 1);
    }
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    if (this.rowType instanceof TypedIdentifier) {
      return this.rowType.getType().containsVoid();
    } else {
      return this.rowType.containsVoid();
    }
  }
}