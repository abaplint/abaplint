import {VoidType} from "../abap/types/basic";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {IRegistry} from "../_iregistry";
import {AbstractObject} from "./_abstract_object";
import {IParseResult} from "./_iobject";

export class DataDefinition extends AbstractObject {
  private sqlViewName: string | undefined = undefined;

  public getType(): string {
    return "DDLS";
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }

  public getSQLViewName(): string | undefined {
    return this.sqlViewName;
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public parseType(_reg: IRegistry): AbstractType {
    // todo
    return new VoidType("DDLS:todo");
  }

  public setDirty(): void {
    this.sqlViewName = undefined;
    super.setDirty();
  }

  public parse(): IParseResult {
    if (this.isDirty() === false) {
      return {updated: false, runtime: 0};
    }

    this.sqlViewName = undefined;
    const asddls = this.getFiles().find(f => f.getFilename().endsWith(".asddls"));
    const match = asddls?.getRaw().match(/@AbapCatalog\.sqlViewName: '(\w+)'/);
    if (match) {
      this.sqlViewName = match[1].toUpperCase();
    }

    return {updated: true, runtime: 0};
  }
}
