import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";

export class TableType extends AbstractObject {

  public getType(): string {
    return "TTYP";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  // todo, cache parsed data
  public parseType(reg: IRegistry): AbstractType {
    const parsed = this.parseXML();
    if (parsed === undefined) {
      return new Types.UnknownType("Table Type, parser error");
    }

    const ddic = new DDIC(reg);
    const dd40v = parsed.abapGit["asx:abap"]["asx:values"].DD40V;
    const rowtype = dd40v.ROWTYPE ? dd40v.ROWTYPE._text : "";
    const rowkind = dd40v.ROWKIND ? dd40v.ROWKIND._text : "";

    if (rowkind === "S") {
      return new Types.TableType(ddic.lookupTable(rowtype));
    } else if (rowkind === "E") {
      return new Types.TableType(ddic.lookupDataElement(rowtype));
    } else if (rowkind === "R") {
      return new Types.TableType(new Types.ObjectReferenceType(rowtype));
    } else if (rowkind === "") {
      const datatype = dd40v.DATATYPE._text;
      const leng = dd40v.LENG ? dd40v.LENG._text : undefined;
      const decimals = dd40v.DECIMALS ? dd40v.DECIMALS._text : undefined;
      const row = ddic.textToType(datatype, leng, decimals);
      return new Types.TableType(row);
    } else {
      return new Types.UnknownType("Table Type, unkown kind \"" + rowkind + "\"");
    }
  }

}
