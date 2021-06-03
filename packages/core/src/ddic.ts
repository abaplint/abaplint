import {IRegistry} from "./_iregistry";
import {AbstractType} from "./abap/types/basic/_abstract_type";
import {Domain} from "./objects/domain";
import {DataElement} from "./objects/data_element";
import {Table} from "./objects/table";
import {TableType} from "./objects/table_type";
import * as Types from "./abap/types/basic";
import {ABAPObject} from "./objects/_abap_object";
import {InfoClassDefinition} from "./abap/4_file_information/_abap_file_information";
import {ObjectReferenceType, UnknownType, VoidType} from "./abap/types/basic";
import {View} from "./objects/view";
import {DataDefinition} from "./objects";

export class DDIC {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  // the class might be local with a local super class with a global exception class as super
  // todo: returns true for both local and global exception classes
  public isException(def: InfoClassDefinition | undefined, _obj: ABAPObject): boolean {
    if (def === undefined) {
      return false;
    }
    if (def.name.toUpperCase() === "CX_ROOT") {
      return true;
    }
    let superClassName = def.superClassName;
    if (superClassName === undefined) {
      return false;
    }

    let i = 0;
    // max depth, make sure not to hit cyclic super class defintions
    while (i++ < 10 && superClassName !== undefined) {
      const found = this.reg.getObject("CLAS", superClassName) as ABAPObject | undefined;
      if (found === undefined) {
        break;
      }

      const superDef: InfoClassDefinition | undefined = found.getMainABAPFile()?.getInfo().getClassDefinitionByName(superClassName);
      if (superDef === undefined) {
        break;
      }

      if (superDef.superClassName) {
        superClassName = superDef.superClassName;
      } else {
        break;
      }
    }

    // todo, this should check for "CX_ROOT"
    const isException = (superClassName?.match(/^.?cx_.*$/i) || superClassName?.match(/^\/.+\/cx_.*$/i)) ? true : false;

    return isException;
  }

  public inErrorNamespace(name: string | undefined): boolean {
    if (name === undefined) {
      return true;
    }
    return this.reg.inErrorNamespace(name);
  }

  public lookupObject(name: string): AbstractType {
    const globalClas = this.reg.getObject("CLAS", name)?.getIdentifier();
    if (globalClas) {
      return new ObjectReferenceType(globalClas);
    }
    const globalIntf = this.reg.getObject("INTF", name)?.getIdentifier();
    if (globalIntf) {
      return new ObjectReferenceType(globalIntf);
    }
    if (this.inErrorNamespace(name) === true) {
      return new UnknownType(name);
    } else {
      return new VoidType(name);
    }
  }

  public lookupNoVoid(name: string): AbstractType | undefined {
    const foundTABL = this.reg.getObject("TABL", name) as Table | undefined;
    if (foundTABL) {
      return foundTABL.parseType(this.reg);
    }

    const foundVIEW = this.reg.getObject("VIEW", name) as Table | undefined;
    if (foundVIEW) {
      return foundVIEW.parseType(this.reg);
    }

    const foundTTYP = this.reg.getObject("TTYP", name) as TableType | undefined;
    if (foundTTYP) {
      return foundTTYP.parseType(this.reg);
    }

    const foundDDLS = this.reg.getObject("DDLS", name) as DataDefinition | undefined;
    if (foundDDLS) {
      return foundDDLS.parseType(this.reg);
    }

    const foundDTEL = this.reg.getObject("DTEL", name) as DataElement | undefined;
    if (foundDTEL) {
      return foundDTEL.parseType(this.reg);
    }

    const upper = name.toUpperCase();
    for (const obj of this.reg.getObjectsByType("DDLS")) {
      const ddls = obj as DataDefinition;
      if (ddls.getSQLViewName() === upper) {
        return ddls.parseType(this.reg);
      }
    }

    return undefined;
  }

  /** lookup with voiding and unknown types */
  public lookup(name: string): AbstractType {
    const found = this.lookupNoVoid(name);
    if (found) {
      return found;
    }

    if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found, lookup");
    } else {
      return new Types.VoidType(name);
    }
  }

  public lookupDomain(name: string): AbstractType {
    const found = this.reg.getObject("DOMA", name) as Domain | undefined;
    if (found) {
      return found.parseType(this.reg);
    } else if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + ", lookupDomain");
    } else {
      return new Types.VoidType(name);
    }
  }

  public lookupDataElement(name: string | undefined): AbstractType {
    if (name === undefined) {
      return new Types.UnknownType("undefined, lookupDataElement");
    }
    const found = this.reg.getObject("DTEL", name) as DataElement | undefined;
    if (found) {
      return found.parseType(this.reg);
    } else if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found, lookupDataElement");
    } else {
      return new Types.VoidType(name);
    }
  }

  public lookupTableOrView(name: string | undefined): AbstractType {
    if (name === undefined) {
      return new Types.UnknownType("undefined, lookupTableOrView");
    }
    const foundTABL = this.reg.getObject("TABL", name) as Table | undefined;
    if (foundTABL) {
      return foundTABL.parseType(this.reg);
    }
    const foundDDLS = this.reg.getObject("DDLS", name) as DataDefinition | undefined;
    if (foundDDLS) {
      return foundDDLS.parseType(this.reg);
    }
    const upper = name.toUpperCase();
    for (const obj of this.reg.getObjectsByType("DDLS")) {
      const ddls = obj as DataDefinition;
      if (ddls.getSQLViewName() === upper) {
        return ddls.parseType(this.reg);
      }
    }
    return this.lookupView(name);
  }

  public lookupTableOrView2(name: string | undefined): Table | DataDefinition | View | undefined {
    if (name === undefined) {
      return undefined;
    }
    const foundTABL = this.reg.getObject("TABL", name) as Table | undefined;
    if (foundTABL) {
      return foundTABL;
    }
    const foundVIEW = this.reg.getObject("VIEW", name) as View | undefined;
    if (foundVIEW) {
      return foundVIEW;
    }
    const foundDDLS = this.reg.getObject("DDLS", name) as DataDefinition | undefined;
    if (foundDDLS) {
      return foundDDLS;
    }
    return undefined;
  }

  public lookupTable(name: string | undefined): AbstractType {
    if (name === undefined) {
      return new Types.UnknownType("undefined, lookupTable");
    }
    const found = this.reg.getObject("TABL", name) as Table | undefined;
    if (found) {
      return found.parseType(this.reg);
    } else if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found, lookupTable");
    } else {
      return new Types.VoidType(name);
    }
  }

  public lookupView(name: string | undefined): AbstractType {
    if (name === undefined) {
      return new Types.UnknownType("undefined, lookupView");
    }
    const found = this.reg.getObject("VIEW", name) as Table | undefined;
    if (found) {
      return found.parseType(this.reg);
    } else if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found, lookupView");
    } else {
      return new Types.VoidType(name);
    }
  }

  public lookupTableType(name: string | undefined): AbstractType {
    if (name === undefined) {
      return new Types.UnknownType("undefined, lookupTableType");
    }
    const found = this.reg.getObject("TTYP", name) as TableType | undefined;
    if (found) {
      return found.parseType(this.reg);
    } else if (this.reg.inErrorNamespace(name)) {
      return new Types.UnknownType(name + " not found, lookupTableType");
    } else {
      return new Types.VoidType(name);
    }
  }

  public textToType(
    text: string | undefined,
    length: string | undefined,
    decimals: string | undefined,
    parent: string,
    qualify = true): AbstractType {

// todo, support short strings, and length of different integers, NUMC vs CHAR, min/max length

    const qualified = qualify ? parent : undefined;

    switch (text) {
      case "DEC":      // 1 <= len <= 31
      case "D16F":     // 1 <= len <= 31
      case "D34F":     // 1 <= len <= 31
      case "DF16_DEC": // 1 <= len <= 31
      case "DF34_DEC": // 1 <= len <= 31
      case "CURR":     // 1 <= len <= 31
      case "QUAN":     // 1 <= len <= 31
        if (length === undefined) {
          return new Types.UnknownType(text + " unknown length, " + parent, parent);
        } else if (decimals === undefined) {
          return new Types.PackedType(parseInt(length, 10), 0, qualified);
        }
        return new Types.PackedType(parseInt(length, 10), parseInt(decimals, 10), qualified);
      case "ACCP":
        return new Types.CharacterType(6, qualified); // YYYYMM
      case "LANG":
        return new Types.CharacterType(1, qualified);
      case "CLNT":
        return new Types.CharacterType(3, qualified);
      case "CUKY":
        return new Types.CharacterType(5, qualified);
      case "UNIT":  // 2 <= len <= 3
        return new Types.CharacterType(3, qualified);
      case "UTCLONG":
        return new Types.CharacterType(27, qualified);
      case "NUMC": // 1 <= len <= 255
      case "CHAR": // 1 <= len <= 30000 (1333 for table fields)
      case "LCHR": // 256 <= len <= 32000
        if (length === undefined) {
          return new Types.UnknownType(text + " unknown length", parent);
        }
        return new Types.CharacterType(parseInt(length, 10), qualified);
      case "RAW":  // 1 <= len <= 32000
      case "LRAW": // 256 <= len <= 32000
        if (length === undefined) {
          return new Types.UnknownType(text + " unknown length", parent);
        }
        return new Types.HexType(parseInt(length, 10), qualified);
      case "TIMS":
        return new Types.TimeType(qualified); //HHMMSS
      case "DECFLOAT16": // len = 16
      case "DECFLOAT34": // len = 34
      case "D16R":       // len = 16
      case "D34R":       // len = 34
      case "DF16_RAW":   // len = 16
      case "DF34_RAW":   // len = 34
      case "FLTP":       // len = 16
        if (length === undefined) {
          return new Types.UnknownType(text + " unknown length", parent);
        }
        return new Types.FloatingPointType(parseInt(length, 10), qualified);
      case "DATS":
        return new Types.DateType(qualified); //YYYYMMDD
      case "INT1":
      case "INT2":
      case "INT4":
      case "INT8":
        return new Types.IntegerType(qualified);
      case "SSTR":    // 1 <= len <= 1333
      case "SSTRING": // 1 <= len <= 1333
      case "STRG":    // 256 <= len
      case "STRING":  // 256 <= len
        return new Types.StringType(qualified);
      case "RSTR":      // 256 <= len
      case "RAWSTRING": // 256 <= len
      case "GEOM_EWKB":
        return new Types.XStringType(qualified);
      case "D16S":
      case "D34S":
      case "DF16_SCL":
      case "DF34_SCL":
      case "PREC":
      case "VARC":
        return new Types.UnknownType(text + " is an obsolete data type", parent);
      default:
        return new Types.UnknownType(text + " unknown", parent);
    }
  }

}
