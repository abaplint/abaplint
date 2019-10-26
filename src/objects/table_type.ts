import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import {Registry} from "../registry";

export class TableType extends AbstractObject {

  public getType(): string {
    return "TTYP";
  }

  public parseType(_reg: Registry): AbstractType {
    return new Types.UnknownType("todo, table type parse type");
  }

}