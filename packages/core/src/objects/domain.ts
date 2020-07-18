import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";

export class Domain extends AbstractObject {

  public getType(): string {
    return "DOMA";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public parseType(reg: IRegistry): AbstractType {
    const xml = this.getXML();
    if (xml === undefined) {
      return new Types.UnknownType("unable to find xml");
    }

    try {
      const ddic = new DDIC(reg);
      const parsed = this.parseXML();
      if (parsed === undefined) {
        return new Types.UnknownType("Domain " + this.getName() + ", parser error");
      }
      const dd01v = parsed.abapGit["asx:abap"]["asx:values"].DD01V;
      const datatype = dd01v.DATATYPE._text;
      const length = dd01v.LENG ? dd01v.LENG._text : undefined;
      const decimals = dd01v.DECIMALS ? dd01v.DECIMALS._text : undefined;
      return ddic.textToType(datatype, length, decimals);
    } catch {
      return new Types.UnknownType("Domain " + this.getName() + "parser error");
    }
  }


}
