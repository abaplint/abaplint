import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";

export class TableType extends AbstractObject {
  private parsedXML: {
    rowtype?: string,
    rowkind?: string
    datatype?: string
    leng?: string
    decimals?: string} | undefined = undefined;

  public getType(): string {
    return "TTYP";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
  }

  public parseType(reg: IRegistry): AbstractType {
    this.parseXML();

    if (this.parsedXML === undefined || this.parsedXML === {}) {
      return new Types.UnknownType("Table Type, parser error");
    }

    const ddic = new DDIC(reg);

    if (this.parsedXML.rowkind === "S") {
      return new Types.TableType(ddic.lookupTableOrView(this.parsedXML.rowtype), false);
    } else if (this.parsedXML.rowkind === "E") {
      return new Types.TableType(ddic.lookupDataElement(this.parsedXML.rowtype), false);
    } else if (this.parsedXML.rowkind === "L") {
      return new Types.TableType(ddic.lookupTableType(this.parsedXML.rowtype), false);
    } else if (this.parsedXML.rowkind === "R" && this.parsedXML.rowtype !== undefined) {
      return new Types.TableType(new Types.ObjectReferenceType(this.parsedXML.rowtype), false);
    } else if (this.parsedXML.rowkind === "") {
      const row = ddic.textToType(this.parsedXML.datatype, this.parsedXML.leng, this.parsedXML.decimals, this.getName());
      return new Types.TableType(row, false);
    } else {
      return new Types.UnknownType("Table Type, unknown kind \"" + this.parsedXML.rowkind + "\"" + this.getName());
    }
  }

////////////////////

  private parseXML() {
    if (this.parsedXML !== undefined) {
      return;
    }

    this.parsedXML = {};

    const parsed = super.parseRaw();
    if (parsed === undefined) {
      return;
    }

    const dd40v = parsed.abapGit["asx:abap"]["asx:values"].DD40V;
    this.parsedXML.rowtype = dd40v.ROWTYPE ? dd40v.ROWTYPE._text : "";
    this.parsedXML.rowkind = dd40v.ROWKIND ? dd40v.ROWKIND._text : "";
    this.parsedXML.datatype = dd40v.DATATYPE?._text;
    this.parsedXML.leng = dd40v.LENG?._text;
    this.parsedXML.decimals = dd40v.DECIMALS?._text;
  }

}
