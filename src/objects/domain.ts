import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import {Registry} from "../registry";
import * as xmljs from "xml-js";

export class Domain extends AbstractObject {

  public getType(): string {
    return "DOMA";
  }

  public parseType(_reg: Registry): AbstractType {
    const xml = this.getXML();
    if (xml === undefined) {
      return new Types.UnknownType("unable to find xml");
    }

    try {
      const parsed: any = xmljs.xml2js(xml, {compact: true});
      const dd01v = parsed.abapGit["asx:abap"]["asx:values"].DD01V;
      const datatype = dd01v.DATATYPE._text;
      switch (datatype) {
        case "CHAR":
          return new Types.CharacterType(parseInt(dd01v.LENG._text, 10));
        case "RAW":
          return new Types.HexType(parseInt(dd01v.LENG._text, 10));
        default:
          return new Types.UnknownType(datatype + " unknown");
      }
    } catch {
      return new Types.UnknownType("Domain parser error");
    }
  }

  private getXML(): string | undefined {
    for (const file of this.getFiles()) {
      if (file.getFilename().match(/\.doma\.xml$/i)) {
        return file.getRaw();
      }
    }
    return undefined;
  }

}