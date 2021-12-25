import {VoidType} from "../abap/types/basic";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {CDSParser} from "../cds/cds_parser";
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

  public findSourceFile() {
    return this.getFiles().find(f => f.getFilename().endsWith(".asddls"));
  }

  public temporaryParse() {
    return new CDSParser().parse(this.findSourceFile());
  }

  public parse(): IParseResult {
    if (this.isDirty() === false) {
      return {updated: false, runtime: 0};
    }

    this.sqlViewName = undefined;
    const match = this.findSourceFile()?.getRaw().match(/@AbapCatalog\.sqlViewName: '(\w+)'/);
    if (match) {
      this.sqlViewName = match[1].toUpperCase();
    }

    return {updated: true, runtime: 0};
  }
}
