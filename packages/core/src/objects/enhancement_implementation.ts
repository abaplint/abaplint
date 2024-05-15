import {AbstractObject} from "./_abstract_object";

export class EnhancementImplementation extends AbstractObject {
  private parsedXML: {
    className?: string,
    description?: string,
  } | undefined;

  public getType(): string {
    return "ENHO";
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getClassName(): string | undefined {
    this.parse();
    return this.parsedXML?.className;
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

    this.parsedXML.className = parsed.abapGit["asx:abap"]["asx:values"].CLASS;
    this.parsedXML.description = parsed.abapGit["asx:abap"]["asx:values"].SHORTTEXT;

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }
}
