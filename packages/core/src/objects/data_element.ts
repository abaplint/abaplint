import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {IRegistry} from "../_iregistry";
import {DDIC, ILookupResult} from "../ddic";
import * as Types from "../abap/types/basic";
import {IObjectAndToken} from "../_iddic_references";

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

  public getDomainName(): string | undefined {
    this.parse();
    return this.parsedXML?.domname;
  }

  public parseType(reg: IRegistry): AbstractType {
    const references: IObjectAndToken[] = [];

    let lookup: ILookupResult | undefined = undefined;
    if (this.parsedXML === undefined) {
      lookup = {type: new Types.UnknownType("Data Element " + this.getName() + ", parser error")};
    } else {
      const ddic = new DDIC(reg);
      if (this.parsedXML.refkind === "D") {
        if (this.parsedXML.domname === undefined || this.parsedXML.domname === "") {
          lookup = {type: new Types.UnknownType("DOMNAME unexpectely empty in " + this.getName())};
        } else {
          lookup = ddic.lookupDomain(this.parsedXML.domname, this.getName());
        }
      } else if (this.parsedXML.refkind === "R") {
        if (this.parsedXML.domname === undefined || this.parsedXML.domname === "") {
          lookup = {type: new Types.UnknownType("DOMNAME unexpectely empty in " + this.getName())};
        } else {
          lookup = ddic.lookupObject(this.parsedXML.domname);
        }
      } else {
        if (this.parsedXML.datatype === undefined || this.parsedXML.datatype === "") {
          lookup = {type: new Types.UnknownType("DATATYPE unexpectely empty in " + this.getName())};
        } else {
          lookup = {type: ddic.textToType(this.parsedXML.datatype, this.parsedXML.leng, this.parsedXML.decimals,
                                          this.getName(), this.getName())};
        }
      }
    }

    if (lookup.object) {
      references.push({object: lookup.object});
    }
    reg.getDDICReferences().setUsing(this, references);
    return lookup.type;
  }

  public parse() {
    if (this.parsedXML !== undefined) {
      return {updated: false, runtime: 0};
    }

    const start = Date.now();
    this.parsedXML = {};
    const parsed = super.parseRaw2();
    if (parsed === undefined) {
      return {updated: false, runtime: 0};
    }

    const dd04v = parsed.abapGit?.["asx:abap"]?.["asx:values"]?.DD04V;
    this.parsedXML = {
      description: dd04v?.DDTEXT,
      refkind: dd04v?.REFKIND,
      domname: dd04v?.DOMNAME,
      datatype: dd04v?.DATATYPE,
      leng: dd04v?.LENG,
      decimals: dd04v?.DECIMALS,
    };

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }

}
