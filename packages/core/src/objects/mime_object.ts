import {IFile} from "../files/_ifile";
import {AbstractObject} from "./_abstract_object";

export class MIMEObject extends AbstractObject {
  private parsedXML: {
    URL?: string,
    CLASS?: string,
  } | undefined;

  public getType(): string {
    return "SMIM";
  }

  public getURL(): string | undefined {
    this.parse();
    return this.parsedXML?.URL;
  }

  public getClass(): string | undefined {
    this.parse();
    return this.parsedXML?.CLASS;
  }

  public getAllowedNaming() {
    return {
      maxLength: 32,
      allowNamespace: false,
    };
  }

  public getDataFile(): IFile | undefined {
    const main = this.getXMLFile();
    for (const f of this.getFiles()) {
      if (f.getFilename() !== main?.getFilename()) {
        return f;
      }
    }
    return undefined;
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
  }

  public getDescription(): string | undefined {
// this object type does not have a description
    return undefined;
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

    this.parsedXML.URL = parsed.abapGit["asx:abap"]["asx:values"].URL;
    this.parsedXML.CLASS = parsed.abapGit["asx:abap"]["asx:values"].CLASS;

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }
}
