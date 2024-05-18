import {AbstractObject} from "./_abstract_object";

export class ExtensionIndex extends AbstractObject {
  private parsedXML: {
    sqltab?: string,
    ddtext?: string,
  } | undefined = undefined;

  public getType(): string {
    return "XINX";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 33,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
  }

  public getDescription(): string | undefined {
    this.parse();
    return this.parsedXML?.ddtext;
  }

  public getTableName(): string | undefined {
    this.parse();
    return this.parsedXML?.sqltab;
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

    const xinx = parsed.abapGit?.["asx:abap"]?.["asx:values"]?.XINX;
    this.parsedXML = {
      sqltab: xinx?.DD12V?.SQLTAB,
      ddtext: xinx?.DD12V?.DDTEXT,
    };

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }
}
