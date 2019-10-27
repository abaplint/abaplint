import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {Registry} from "../registry";
import {DDIC} from "../ddic";
import * as Types from "../abap/types/basic";

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
      const parsed = this.parseXML();
      const dd04v = parsed.abapGit["asx:abap"]["asx:values"].DD04V;
      const ddic = new DDIC(reg);

      if (dd04v.REFKIND && dd04v.REFKIND._text === "D") {
        const name = dd04v.DOMNAME._text;
        return ddic.lookupDomain(name);
      }

      const datatype = dd04v.DATATYPE._text;
      const length = dd04v.LENG._text;
      return ddic.textToType(datatype, length);
    } catch {
      return new Types.UnknownType("Data Element, parser exception");
    }
  }

}