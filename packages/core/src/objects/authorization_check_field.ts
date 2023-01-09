import {DDIC} from "../ddic";
import {IObjectAndToken} from "../_iddic_references";
import {IRegistry} from "../_iregistry";
import {AbstractObject} from "./_abstract_object";

export class AuthorizationCheckField extends AbstractObject {
  private parsedXML: {
    rollname?: string,
  } | undefined;

  public getType(): string {
    return "AUTH";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public getDataElementName(): string | undefined {
    this.parse();
    return this.parsedXML?.rollname;
  }

  public parseType(reg: IRegistry): void {
    this.parse();

    const references: IObjectAndToken[] = [];
    const ddic = new DDIC(reg);

    if (this.parsedXML?.rollname) {
      const found = ddic.lookupDataElement(this.parsedXML?.rollname);
      if (found.object) {
        references.push({object: found.object});
      }
    }
    reg.getDDICReferences().setUsing(this, references);
  }

  public parse() {
    if (this.parsedXML) {
      return {updated: false, runtime: 0};
    }

    const start = Date.now();
    this.parsedXML = {};
    const parsed = super.parseRaw2();

    if (parsed === undefined
        || parsed.abapGit === undefined
        || parsed.abapGit["asx:abap"]["asx:values"] === undefined) {
      return {updated: false, runtime: 0};
    }

    this.parsedXML.rollname = parsed.abapGit["asx:abap"]["asx:values"].AUTHX?.ROLLNAME;

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }
}
