import {AbstractObject} from "./_abstract_object";

export class NumberRange extends AbstractObject {
  private parsedXML: {
    description?: string,
    domain?: string,
    percentage?: number,
  } | undefined;

  public getType(): string {
    return "NROB";
  }

  public getAllowedNaming() {
    return {
      maxLength: 10,
      allowNamespace: true,
    };
  }

  public getDomain(): string | undefined {
    this.parse();
    return this.parsedXML?.domain;
  }

  public getPercentage(): number | undefined {
    this.parse();
    return this.parsedXML?.percentage;
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
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

    const text = parsed.abapGit?.["asx:abap"]?.["asx:values"]?.TEXT;
    this.parsedXML.description = text?.TXT;
    const attributes = parsed.abapGit?.["asx:abap"]?.["asx:values"]?.ATTRIBUTES;
    this.parsedXML.domain = attributes?.DOMLEN;
    this.parsedXML.percentage = parseFloat(attributes?.PERCENTAGE || "");

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }

  public getDescription(): string | undefined {
    this.parse();
    return this.parsedXML?.description;
  }
}