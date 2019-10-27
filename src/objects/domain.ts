import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import {Registry} from "../registry";
import * as xmljs from "xml-js";
import {DDIC} from "../ddic";

export class Domain extends AbstractObject {

  public getType(): string {
    return "DOMA";
  }

  public parseType(reg: Registry): AbstractType {
    const xml = this.getXML();
    if (xml === undefined) {
      return new Types.UnknownType("unable to find xml");
    }

    try {
      const parsed: any = xmljs.xml2js(xml, {compact: true});
      const dd01v = parsed.abapGit["asx:abap"]["asx:values"].DD01V;
      const datatype = dd01v.DATATYPE._text;
      const length = dd01v.LENG._text;
      const ddic = new DDIC(reg);
      return ddic.textToType(datatype, length);
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