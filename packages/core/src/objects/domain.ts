import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";

export class Domain extends AbstractObject {
  private parsedType: AbstractType | undefined;

  public getType(): string {
    return "DOMA";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.parsedType = undefined;
    super.setDirty();
  }

  public parseType(reg: IRegistry): AbstractType {
    if (this.parsedType === undefined) {
      this.parsedType = this.parseXML(reg);
    }
    return this.parsedType;
  }

///////////////

  protected parseXML(reg: IRegistry): AbstractType {
    const parsed = super.parseXML();
    if (parsed === undefined) {
      return new Types.UnknownType("Domain " + this.getName() + "parser error");
    }

    const ddic = new DDIC(reg);
    const dd01v = parsed.abapGit["asx:abap"]["asx:values"].DD01V;
    const datatype = dd01v.DATATYPE?._text;
    const length = dd01v.LENG?._text;
    const decimals = dd01v.DECIMALS?._text;
    return ddic.textToType(datatype, length, decimals);
  }

}
