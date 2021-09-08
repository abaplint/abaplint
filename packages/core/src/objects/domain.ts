import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";

export class Domain extends AbstractObject {

  private parsedXML: {
    description?: string,
    datatype?: string,
    length?: string,
    decimals?: string,
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
    this.parsedType = ddic.textToType(this.parsedXML.datatype, this.parsedXML.length, this.parsedXML.decimals, this.getName());
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
    this.parsedXML = {
      description: dd01v?.DDTEXT,
      datatype: dd01v?.DATATYPE,
      length: dd01v?.LENG,
      decimals: dd01v?.DECIMALS,
    };
    const end = Date.now();
    return {updated: true, runtime: end - start};
  }

  public getFixedValues(): string[] {
    return ["not", "yet", "implemented"];
  }

}
