import {AbstractType} from "./_abstract_type";

export enum TableAccessType {
  standard = "STANDARD",
  sorted = "SORTED",
  hashed = "HASHED",
  index = "INDEX",
  any = "ANY",
}

export type ITableKey = {
  name: string,
  type?: TableAccessType,
  keyFields: string[],
  isUnique: boolean,
};

export type ITableOptions = {
  withHeader: boolean,
  primaryKey?: ITableKey,
  secondary?: ITableKey[],
};

export class TableType extends AbstractType {
  private readonly rowType: AbstractType;
  private readonly options: ITableOptions;

  public constructor(rowType: AbstractType, options: ITableOptions, qualifiedName?: string) {
    super({qualifiedName: qualifiedName});
    this.rowType = rowType;
    this.options = options;
    if (options.primaryKey?.type === TableAccessType.standard && options.primaryKey.isUnique === true) {
      throw new Error("STANDARD tables cannot have UNIQUE key");
    }
  }

  public getOptions(): ITableOptions {
    return this.options;
  }

  public isWithHeader(): boolean {
    return this.options.withHeader;
  }

  public getAccessType(): TableAccessType | undefined {
    return this.options.primaryKey?.type;
  }

  public getRowType(): AbstractType {
    return this.rowType;
  }

  public toABAP(): string {
// todo, this is used for downport, so use default key for now
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
    if (this.options.primaryKey?.type !== TableAccessType.standard
        && this.options.primaryKey?.keyFields.length === 0) {
      return true;
    }
    return this.rowType.isGeneric();
  }

  public containsVoid() {
    return this.rowType.containsVoid();
  }

  public toCDS() {
    return "abap.TODO_TABLE";
  }
}