import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";
import {xmlToArray} from "../xml_utils";

export interface DomainValue {
  language: string,
  value: string,
  description: string
}

export class Domain extends AbstractObject {

  private parsedXML: {
    description?: string,
    datatype?: string,
    length?: string,
    decimals?: string,
    values?: DomainValue[],
  } | undefined;
  private parsedType: AbstractType | undefined;

  public getType(): string {
    return "DOMA";
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
    this.parsedType = undefined;
    super.setDirty();
  }

  public parseType(reg: IRegistry): AbstractType {
    if (this.parsedType) {
      return this.parsedType;
    } else if (this.parsedXML === undefined) {
      return new Types.UnknownType("Domain " + this.getName() + " parser error", this.getName());
    }
    const ddic = new DDIC(reg);
    this.parsedType = ddic.textToType(this.parsedXML.datatype, this.parsedXML.length, this.parsedXML.decimals, this.getName(), false);
    return this.parsedType;
  }

  public parse() {
    if (this.parsedXML) {
      return {updated: false, runtime: 0};
    }

    const start = Date.now();
    this.parsedXML = {};
    const parsed = super.parseRaw2();
    if (parsed === undefined) {
      return {updated: false, runtime: 0};
    }

    const dd01v = parsed.abapGit?.["asx:abap"]?.["asx:values"]?.DD01V;
    const dd07v_tab = xmlToArray(parsed.abapGit?.["asx:abap"]?.["asx:values"]?.DD07V_TAB?.DD07V);
    const values: DomainValue[] = [];
    for (const ddo7v of dd07v_tab) {
      const value: DomainValue = {
        description: ddo7v?.DDTEXT,
        value: ddo7v?.DOMVALUE_L,
        language: ddo7v?.DDLANGUAGE,
      };
      values.push(value);
    }

    this.parsedXML = {
      description: dd01v?.DDTEXT,
      datatype: dd01v?.DATATYPE,
      length: dd01v?.LENG,
      decimals: dd01v?.DECIMALS,
      values: values,
    };
    const end = Date.now();
    return {updated: true, runtime: end - start};
  }

  public getFixedValues() {
    return this.parsedXML?.values ?? [];
  }

}