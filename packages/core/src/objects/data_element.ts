import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";
import * as Types from "../abap/types/basic";

export class DataElement extends AbstractObject {
  private parsedXML: {
    refkind?: string,
    domname?: string,
    datatype?: string,
    leng?: string,
    decimals?: string} | undefined = undefined;

  public getType(): string {
    return "DTEL";
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
// note that this might look up in the Registry, so dont cache the resulting type, only the XML
    this.parseXML();

    if (this.parsedXML === undefined || this.parsedXML === {}) {
      return new Types.UnknownType("Data Element " + this.getName() + ", parser error");
    }

    const ddic = new DDIC(reg);

    if (this.parsedXML.refkind === "D" && this.parsedXML.domname) {
      const lookup = ddic.lookupDomain(this.parsedXML.domname);
      return lookup;
    }

    return ddic.textToType(this.parsedXML.datatype, this.parsedXML.leng, this.parsedXML.decimals, this.getName());
  }

////////////////////

  protected parseXML() {
    if (this.parsedXML !== undefined) {
      return;
    }

    this.parsedXML = {};

    const parsed = super.parseXML();
    if (parsed === undefined) {
      return;
    }

    const dd04v = parsed.abapGit["asx:abap"]["asx:values"].DD04V;

    this.parsedXML.refkind = dd04v?.REFKIND?._text;
    this.parsedXML.domname = dd04v?.DOMNAME?._text;
    this.parsedXML.datatype = dd04v?.DATATYPE?._text;
    this.parsedXML.leng = dd04v?.LENG?._text;
    this.parsedXML.decimals = dd04v?.DECIMALS?._text;
  }

}
