import {AbstractType} from "./_abstract_type";

export enum TableAccessType {
  standard = "STANDARD",
  sorted = "SORTED",
  hashed = "HASHED",
  index = "INDEX",
  any = "ANY",
}

export enum TableKeyType {
  default = "DEFAULT",
  user = "USER",
  empty = "EMPTY",
}

export type ITableKey = {
  name: string,
  type: TableAccessType,
  keyFields: string[],
  isUnique: boolean,
};

export type ITableOptions = {
  withHeader: boolean,
  keyType: TableKeyType,
  primaryKey?: ITableKey,
  secondary?: ITableKey[],
  /** table type defined via TYPES without specifying the key, ie. generic regarding the key */
  genericKey?: boolean,
};

export class TableType extends AbstractType {
  private readonly rowType: AbstractType;
  private readonly options: ITableOptions;

  public constructor(rowType: AbstractType, options: ITableOptions, qualifiedName?: string, description?: string) {
    super({
      qualifiedName: qualifiedName,
      description: description,
    });
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

  /** the table key is not specified, so the type is generic regarding the key,
   * it can be used for typing, but not as a structure component */
  public hasGenericKey(): boolean {
    return this.options.genericKey === true;
  }

  public isGeneric() {
    if (this.options.primaryKey?.type !== TableAccessType.standard
        && this.options.keyType === TableKeyType.user
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