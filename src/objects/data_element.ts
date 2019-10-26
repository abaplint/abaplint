import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {Registry} from "../registry";
import {Domain} from "./domain";
import * as Types from "../abap/types/basic";
import * as xmljs from "xml-js";

export class DataElement extends AbstractObject {

  public getType(): string {
    return "DTEL";
  }

  public parseType(reg: Registry): AbstractType {
    const xml = this.getXML();
    if (xml === undefined) {
      return new Types.UnknownType("unable to find xml");
    }

    try {
      const parsed: any = xmljs.xml2js(xml, {compact: true});
      const dd04v = parsed.abapGit["asx:abap"]["asx:values"].DD04V;

      if (dd04v.REFKIND && dd04v.REFKIND._text === "D") {
        const name = dd04v.DOMNAME._text;
        const found = reg.getObject("DOMA", name) as Domain | undefined;
        if (found) {
          return found.parseType(reg);
        }
        if (reg.inErrorNamespace(name)) {
          return new Types.UnknownType(name + " not found");
        } else {
          return new Types.VoidType();
        }
      }

      const datatype = dd04v.DATATYPE._text;
      switch (datatype) {
        case "CHAR":
          return new Types.CharacterType(parseInt(dd04v.LENG._text, 10));
        case "RAW":
          return new Types.HexType(parseInt(dd04v.LENG._text, 10));
        case "INT4":
          return new Types.IntegerType();
        case "SSTR":
          return new Types.StringType();
        default:
          return new Types.UnknownType(datatype + " unknown");
      }
    } catch {
      return new Types.UnknownType("Data Element, parser exception");
    }
  }

  private getXML(): string | undefined {
    for (const file of this.getFiles()) {
      if (file.getFilename().match(/\.dtel\.xml$/i)) {
        return file.getRaw();
      }
    }
    return undefined;
  }

}