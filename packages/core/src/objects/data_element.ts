import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";
import * as Types from "../abap/types/basic";

export class DataElement extends AbstractObject {
  private parsedXML: {
    description?: string,
    refkind?: string,
    domname?: string,
    datatype?: string,
    leng?: string,
    decimals?: string} | undefined = undefined;

  public getType(): string {
    return "DTEL";
  }

  public getDescription(): string | undefined {
    return this.parsedXML?.description;
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
    let type: AbstractType;
    if (this.parsedXML === undefined || this.parsedXML === {}) {
      type = new Types.UnknownType("Data Element " + this.getName() + ", parser error");
    } else {
      const ddic = new DDIC(reg);
      if (this.parsedXML.refkind === "D" && this.parsedXML.domname) {
        type = ddic.lookupDomain(this.parsedXML.domname);
      } else {
        type = ddic.textToType(this.parsedXML.datatype, this.parsedXML.leng, this.parsedXML.decimals, this.getName());
      }
    }

    return type;
  }

  public parse() {
    if (this.parsedXML !== undefined) {
      return {updated: false, runtime: 0};
    }

    const start = Date.now();
    this.parsedXML = {};
    const parsed = super.parseRaw();
    if (parsed === undefined) {
      return {updated: false, runtime: 0};
    }

    const dd04v = parsed.abapGit?.["asx:abap"]?.["asx:values"]?.DD04V;
    this.parsedXML = {
      description: dd04v?.DDTEXT?._text,
      refkind: dd04v?.REFKIND?._text,
      domname: dd04v?.DOMNAME?._text,
      datatype: dd04v?.DATATYPE?._text,
      leng: dd04v?.LENG?._text,
      decimals: dd04v?.DECIMALS?._text,
    };
    const end = Date.now();
    return {updated: true, runtime: end - start};
  }

}
