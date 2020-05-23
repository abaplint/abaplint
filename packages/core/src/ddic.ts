import {IRegistry} from "./_iregistry";
import {AbstractType} from "./abap/types/basic/_abstract_type";
import {Domain} from "./objects/domain";
import {DataElement} from "./objects/data_element";
import {Table} from "./objects/table";
import {TableType} from "./objects/table_type";
import * as Types from "./abap/types/basic";

export class DDIC {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public inErrorNamespace(name: string | undefined): boolean {
    if (name === undefined) {
      return true;
    }
    return this.reg.inErrorNamespace(name);
  }

  public lookup(name: string): AbstractType {
    const dtel = this.lookupDataElement(name);
    if (!(dtel instanceof Types.VoidType) && !(dtel instanceof Types.UnknownType)) {
      return dtel;
    }
    const tabl = this.lookupTable(name);
    if (!(tabl instanceof Types.VoidType) && !(tabl instanceof Types.UnknownType)) {
      return tabl;
    }
    const ttyp = this.lookupTableType(name);
    if (!(ttyp instanceof Types.VoidType) && !(ttyp instanceof Types.UnknownType)) {
      return ttyp;
    }

    if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found");
    } else {
      return new Types.VoidType();
    }
  }

  public lookupDomain(name: string): AbstractType {
    const found = this.reg.getObjectByType(Domain, name);
    if (found) {
      return found.parseType(this.reg);
    } else if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found");
    } else {
      return new Types.VoidType();
    }
  }

  public lookupDataElement(name: string): AbstractType {
    const found = this.reg.getObjectByType(DataElement, name);
    if (found) {
      return found.parseType(this.reg);
    } else if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found");
    } else {
      return new Types.VoidType();
    }
  }

  public lookupTable(name: string): AbstractType {
    const found = this.reg.getObjectByType(Table, name);
    if (found) {
      return found.parseType(this.reg);
    } else if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found");
    } else {
      return new Types.VoidType();
    }
  }

  public lookupTableType(name: string): AbstractType {
    const found = this.reg.getObjectByType(TableType, name);
    if (found) {
      return found.parseType(this.reg);
    } else if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found");
    } else {
      return new Types.VoidType();
    }
  }

  public textToType(text: string, length: string | undefined, decimals: string | undefined): AbstractType {
// todo, support short strings, and length of different integers, NUMC vs CHAR
    switch (text) {
      case "DEC":
        if (length === undefined || decimals === undefined) {
          return new Types.UnknownType(text + " unknown length or decimals");
        }
        return new Types.PackedType(parseInt(length, 10), parseInt(decimals, 10));
      case "NUMC":
      case "CHAR":
      case "LCHR":
        if (length === undefined) {
          return new Types.UnknownType(text + " unknown length");
        }
        return new Types.CharacterType(parseInt(length, 10));
      case "RAW":
        if (length === undefined) {
          return new Types.UnknownType(text + " unknown length");
        }
        return new Types.HexType(parseInt(length, 10));
      case "TIMS":
        return new Types.TimeType();
      case "FLTP":
        if (length === undefined) {
          return new Types.UnknownType(text + " unknown length");
        }
        return new Types.FloatingPointType(parseInt(length, 10));
      case "DATS":
        return new Types.DateType();
      case "INT1":
      case "INT2":
      case "INT4":
      case "INT8":
        return new Types.IntegerType();
      case "SSTR":
      case "STRG":
        return new Types.StringType();
      case "RSTR":
        return new Types.XStringType();
      default:
        return new Types.UnknownType(text + " unknown");
    }
  }

}