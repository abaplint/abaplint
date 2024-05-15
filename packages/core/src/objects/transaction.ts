import {AbstractObject} from "./_abstract_object";

export class Transaction extends AbstractObject {
  private parsedXML: {
    description?: string,
    programName?: string,
  } | undefined;

  public getType(): string {
    return "TRAN";
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
  }

  public getAllowedNaming() {
    return {
      maxLength: 20,
      allowNamespace: true,
    };
  }

  public getProgramName(): string | undefined {
    this.parse();
    return this.parsedXML?.programName;
  }

  public getDescription(): string | undefined {
    this.parse();
    return this.parsedXML?.description;
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

    this.parsedXML.description = parsed.abapGit["asx:abap"]["asx:values"].TSTCT.TTEXT;
    this.parsedXML.programName = parsed.abapGit["asx:abap"]["asx:values"].TSTC.PGMNA;

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }
}