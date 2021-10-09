/* eslint-disable default-case */
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
import {IObject} from "./objects/_iobject";

export interface ILookupResult {
  type: AbstractType;
  object?: IObject;
}

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

  public lookupBuiltinType(name: string, length?: number, decimals?: number): AbstractType | undefined {
    switch (name) {
      case "STRING":
        return new Types.StringType(name);
      case "XSTRING":
        return new Types.XStringType(name);
      case "D":
        return new Types.DateType(name);
      case "T":
        return new Types.TimeType(name);
      case "XSEQUENCE":
        return new Types.XSequenceType();
      case "CLIKE":
        return new Types.CLikeType();
      case "ANY":
        return new Types.AnyType();
      case "SIMPLE":
        return new Types.SimpleType();
      case "%_C_POINTER":
        return new Types.HexType(8);
      case "TABLE":
        return new Types.TableType(new Types.AnyType(), {withHeader: false});
      case "DATA":
        return new Types.AnyType();
      case "NUMERIC":
        return new Types.NumericGenericType();
      case "UTCLONG": // todo, take version into account
        return new Types.UTCLongType();
      case "DECFLOAT16":
        return new Types.DecFloat16Type();
      case "DECFLOAT34":
        return new Types.DecFloat34Type();
      case "CSEQUENCE":
        return new Types.CSequenceType();
      case "I":
      case "INT8": // todo, take version into account
        return new Types.IntegerType(name);
      case "F":
        return new Types.FloatType(name);
      case "P":
        if (length && decimals) {
          return new Types.PackedType(length, decimals);
        } else if (length) {
          return new Types.PackedType(length, 0);
        } else {
          return new Types.PackedType(1, 0);
        }
      case "C":
        if (length) {
          return new Types.CharacterType(length);
        } else {
          return new Types.CharacterType(1);
        }
      case "X":
        if (length) {
          return new Types.HexType(length);
        } else {
          return new Types.HexType(1);
        }
      case "N":
        if (length) {
          return new Types.NumericType(length);
        } else {
          return new Types.NumericType(1);
        }
    }
    return undefined;
  }

  public inErrorNamespace(name: string | undefined): boolean {
    if (name === undefined) {
      return true;
    }
    return this.reg.inErrorNamespace(name);
  }

  public lookupObject(name: string): ILookupResult {
    const clas = this.reg.getObject("CLAS", name);
    const globalClas = clas?.getIdentifier();
    if (globalClas) {
      return {type: new ObjectReferenceType(globalClas, name), object: clas};
    }
    const intf = this.reg.getObject("INTF", name);
    const globalIntf = intf?.getIdentifier();
    if (globalIntf) {
      return {type: new ObjectReferenceType(globalIntf, name), object: intf};
    }
    if (this.inErrorNamespace(name) === true) {
      return {type: new UnknownType(name)};
    } else {
      return {type: new VoidType(name)};
    }
  }

  public lookupNoVoid(name: string): ILookupResult | undefined {
    const foundTABL = this.reg.getObject("TABL", name) as Table | undefined;
    if (foundTABL) {
      return {type: foundTABL.parseType(this.reg), object: foundTABL};
    }

    const foundVIEW = this.reg.getObject("VIEW", name) as Table | undefined;
    if (foundVIEW) {
      return {type: foundVIEW.parseType(this.reg), object: foundVIEW};
    }

    const foundTTYP = this.reg.getObject("TTYP", name) as TableType | undefined;
    if (foundTTYP) {
      return {type: foundTTYP.parseType(this.reg), object: foundTTYP};
    }

    const foundDDLS = this.reg.getObject("DDLS", name) as DataDefinition | undefined;
    if (foundDDLS) {
      return {type: foundDDLS.parseType(this.reg), object: foundDDLS};
    }

    const foundDTEL = this.reg.getObject("DTEL", name) as DataElement | undefined;
    if (foundDTEL) {
      return {type: foundDTEL.parseType(this.reg), object: foundDTEL};
    }

    const upper = name.toUpperCase();
    for (const obj of this.reg.getObjectsByType("DDLS")) {
      const ddls = obj as DataDefinition;
      if (ddls.getSQLViewName() === upper) {
        return {type: ddls.parseType(this.reg), object: obj};
      }
    }

    return undefined;
  }

  /** lookup with voiding and unknown types */
  public lookup(name: string): ILookupResult {
    const found = this.lookupNoVoid(name);
    if (found) {
      return found;
    }

    if (this.reg.inErrorNamespace(name)) {
      return {type: new Types.UnknownType(name + " not found, lookup")};
    } else {
      return {type: new Types.VoidType(name)};
    }
  }

  public lookupDomain(name: string): ILookupResult {
    const found = this.reg.getObject("DOMA", name) as Domain | undefined;
    if (found) {
      return {type: found.parseType(this.reg), object: found};
    } else if (this.reg.inErrorNamespace(name)) {
      return {type: new Types.UnknownType(name + ", lookupDomain"), object: undefined};
    } else {
      return {type: new Types.VoidType(name), object: undefined};
    }
  }

  public lookupDataElement(name: string | undefined): ILookupResult {
    if (name === undefined) {
      return {type: new Types.UnknownType("undefined, lookupDataElement")};
    }
    const found = this.reg.getObject("DTEL", name) as DataElement | undefined;
    if (found) {
      return {type: found.parseType(this.reg), object: found};
    } else if (this.reg.inErrorNamespace(name)) {
      return {type: new Types.UnknownType(name + " not found, lookupDataElement")};
    } else {
      return {type: new Types.VoidType(name)};
    }
  }

  public lookupTableOrView(name: string | undefined): ILookupResult {
    if (name === undefined) {
      return {type: new Types.UnknownType("undefined, lookupTableOrView")};
    }
    const foundTABL = this.reg.getObject("TABL", name) as Table | undefined;
    if (foundTABL) {
      return {type: foundTABL.parseType(this.reg), object: foundTABL};
    }
    const foundDDLS = this.reg.getObject("DDLS", name) as DataDefinition | undefined;
    if (foundDDLS) {
      return {type: foundDDLS.parseType(this.reg), object: foundDDLS};
    }
    const upper = name.toUpperCase();
    for (const obj of this.reg.getObjectsByType("DDLS")) {
      const ddls = obj as DataDefinition;
      if (ddls.getSQLViewName() === upper) {
        return {type: ddls.parseType(this.reg), object: ddls};
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
    const upper = name.toUpperCase();
    for (const obj of this.reg.getObjectsByType("DDLS")) {
      const ddls = obj as DataDefinition;
      if (ddls.getSQLViewName() === upper) {
        return ddls;
      }
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

  private lookupView(name: string | undefined): ILookupResult {
    if (name === undefined) {
      return {type: new Types.UnknownType("undefined, lookupView")};
    }
    const found = this.reg.getObject("VIEW", name) as Table | undefined;
    if (found) {
      return {type: found.parseType(this.reg), object: found};
    } else if (this.reg.inErrorNamespace(name)) {
      return {type: new Types.UnknownType(name + " not found, lookupView")};
    } else {
      return {type: new Types.VoidType(name)};
    }
  }

  public lookupTableType(name: string | undefined): ILookupResult {
    if (name === undefined) {
      return {type: new Types.UnknownType("undefined, lookupTableType")};
    }
    const found = this.reg.getObject("TTYP", name) as TableType | undefined;
    if (found) {
      return {type: found.parseType(this.reg), object: found};
    } else if (this.reg.inErrorNamespace(name)) {
      return {type: new Types.UnknownType(name + " not found, lookupTableType")};
    } else {
      return {type: new Types.VoidType(name)};
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
        if (length === undefined) {
          return new Types.UnknownType(text + " unknown length", parent);
        }
        return new Types.NumericType(parseInt(length, 10), qualified);
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
      case "TIMN": // Native HANA
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
      case "DATN": // Native HANA
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
