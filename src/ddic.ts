import {IRegistry} from "./_iregistry";
import {AbstractType} from "./abap/types/basic/_abstract_type";
import * as Objects from "./objects";
import * as Types from "./abap/types/basic";

export class DDIC {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public lookup(name: string): AbstractType | undefined {
    const dtel = this.lookupDataElement(name);
    if (dtel) {
      return dtel;
    }
    const tabl = this.lookupTable(name);
    if (tabl) {
      return tabl;
    }
    const ttyp = this.lookupTableType(name);
    if (ttyp) {
      return ttyp;
    }

    return undefined;
  }

  public lookupDomain(name: string): AbstractType {
    const found = this.reg.getObject("DOMA", name) as Objects.Domain | undefined;
    if (found) {
      return found.parseType(this.reg);
    }
    if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found");
    } else {
      return new Types.VoidType();
    }
  }

  public lookupDataElement(name: string): AbstractType {
    const found = this.reg.getObject("DTEL", name) as Objects.DataElement | undefined;
    if (found) {
      return found.parseType(this.reg);
    }
    if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found");
    } else {
      return new Types.VoidType();
    }
  }

  public lookupTable(name: string): AbstractType {
    const found = this.reg.getObject("TABL", name) as Objects.Table | undefined;
    if (found) {
      return found.parseType(this.reg);
    }
    if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found");
    } else {
      return new Types.VoidType();
    }
  }

  public lookupTableType(name: string): AbstractType {
    const found = this.reg.getObject("TTYP", name) as Objects.Table | undefined;
    if (found) {
      return found.parseType(this.reg);
    }
    if (this.reg.inErrorNamespace(name)) {
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