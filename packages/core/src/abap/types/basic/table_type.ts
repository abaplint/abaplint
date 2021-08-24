import {AbstractType} from "./_abstract_type";

export enum TableAccessType {
  standard = "STANDARD",
  sorted = "SORTED",
  hashed = "HASHED",
  index = "INDEX",
  any = "ANY",
}

// todo, handling of secondary keys
export type ITableOptions = {
  type?: TableAccessType,
  keyFields?: string[],
  isUnique?: boolean,
  withHeader: boolean,
};

export class TableType extends AbstractType {
  private readonly rowType: AbstractType;
  private readonly options: ITableOptions;

  public constructor(rowType: AbstractType, options: ITableOptions, qualifiedName?: string) {
    super(qualifiedName);
    this.rowType = rowType;
    this.options = options;
  }

  public getOptions(): ITableOptions {
    return this.options;
  }

  public isWithHeader(): boolean {
    return this.options.withHeader;
  }

  public getAccessType(): TableAccessType | undefined {
    return this.options.type;
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

    if (this.options.withHeader === true) {
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