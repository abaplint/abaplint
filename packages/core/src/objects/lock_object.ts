import {AbstractObject} from "./_abstract_object";

export class LockObject extends AbstractObject {
  private parsedXML: {
    primaryTable?: string,
    description?: string,
  } | undefined;

  public getType(): string {
    return "ENQU";
  }

  public getAllowedNaming() {
    return {
      maxLength: 16,
      allowNamespace: true,
    };
  }

  public getPrimaryTable(): string | undefined {
    this.parse();
    return this.parsedXML?.primaryTable;
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

    this.parsedXML.primaryTable = parsed.abapGit["asx:abap"]["asx:values"].DD25V?.ROOTTAB;
    this.parsedXML.description = parsed.abapGit["asx:abap"]["asx:values"].DD25V?.DDTEXT;

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }

  public getDescription(): string | undefined {
    this.parse();
    return this.parsedXML?.description;
  }
}
