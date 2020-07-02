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
    const tabl = this.lookupTable(name);
    if (!(tabl instanceof Types.VoidType) && !(tabl instanceof Types.UnknownType)) {
      return tabl;
    }
    const ttyp = this.lookupTableType(name);
    if (!(ttyp instanceof Types.VoidType) && !(ttyp instanceof Types.UnknownType)) {
      return ttyp;
    }
    return this.lookupDataElement(name);
  }

  public lookupDomain(name: string): AbstractType {
    const found = this.reg.getObjectByType(Domain, name);
    if (found) {
      return found.parseType(this.reg);
    } else if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found");
    } else {
      return new Types.VoidType(name);
    }
  }

  public lookupDataElement(name: string): AbstractType {
    const found = this.reg.getObjectByType(DataElement, name);
    if (found) {
      return found.parseType(this.reg);
    } else if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found");
    } else {
      return new Types.VoidType(name);
    }
  }

  public lookupTable(name: string): AbstractType {
    const found = this.reg.getObjectByType(Table, name);
    if (found) {
      return found.parseType(this.reg);
    } else if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found");
    } else {
      return new Types.VoidType(name);
    }
  }

  public lookupTableType(name: string): AbstractType {
    const found = this.reg.getObjectByType(TableType, name);
    if (found) {
      return found.parseType(this.reg);
    } else if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found");
    } else {
      return new Types.VoidType(name);
    }
  }

  public textToType(text: string, length: string | undefined, decimals: string | undefined): AbstractType {
// todo, support short strings, and length of different integers, NUMC vs CHAR, min/max length 
    switch (text) {
      case "DEC":      // 1 <= len <= 31
      case "DF16_DEC": // 1 <= len <= 31
      case "DF34_DEC": // 1 <= len <= 31
      case "CURR":     // 1 <= len <= 31
      case "QUAN":     // 1 <= len <= 31
        if (length === undefined || decimals === undefined) {
          return new Types.UnknownType(text + " unknown length or decimals");
        }
        return new Types.PackedType(parseInt(length, 10), parseInt(decimals, 10));
      case "ACCP":
        return new Types.CharacterType(6); // YYYYMM
      case "LANG":
        return new Types.CharacterType(1);
      case "CLNT":
        return new Types.CharacterType(3);
      case "CUKY":
        return new Types.CharacterType(5);
      case "UNIT":  // 2 <= len <= 3
        return new Types.CharacterType(3);
      case "UTCLONG":
        return new Types.CharacterType(27);
      case "NUMC": // 1 <= len <= 255
      case "CHAR": // 1 <= len <= 30000 (1333 for table fields)
      case "LCHR": // 256 <= len <= 32000
        if (length === undefined) {
          return new Types.UnknownType(text + " unknown length");
        }
        return new Types.CharacterType(parseInt(length, 10));
      case "RAW":  // 1 <= len <= 32000
      case "LRAW": // 256 <= len <= 32000
        if (length === undefined) {
          return new Types.UnknownType(text + " unknown length");
        }
        return new Types.HexType(parseInt(length, 10));
      case "TIMS":
        return new Types.TimeType(); //HHMMSS
      case "DECFLOAT16": // len = 16
      case "DECFLOAT34": // len = 34
      case "DF16_RAW":   // len = 16
      case "DF34_RAW":   // len = 34
      case "FLTP":       // len = 16
        if (length === undefined) {
          return new Types.UnknownType(text + " unknown length");
        }
        return new Types.FloatingPointType(parseInt(length, 10));
      case "DATS":
        return new Types.DateType(); //YYYYMMDD
      case "INT1":
      case "INT2":
      case "INT4":
      case "INT8":
        return new Types.IntegerType();
      case "SSTR":    // 1 <= len <= 1333
      case "SSTRING": // 1 <= len <= 1333
      case "STRG":    // 256 <= len
      case "STRING":  // 256 <= len
        return new Types.StringType();
      case "RSTR":      // 256 <= len
      case "RAWSTRING": // 256 <= len
      case "GEOM_EWKB":
        return new Types.XStringType();
      case "DF16_SCL":
      case "DF34_SCL":
      case "PREC":
      case "VARC":
        return new Types.UnknownType(text + " is an obsolete data type");
      default:
        return new Types.UnknownType(text + " unknown");
    }
  }

}
