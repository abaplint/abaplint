import {IFile} from "../files/_ifile";
import {AbstractObject} from "./_abstract_object";
import {IAllowedNaming} from "./_iobject";

export class WebMIME extends AbstractObject {
  private parsedXML: {
    description?: string,
  } | undefined;

  public getType(): string {
    return "W3MI";
  }

  public getAllowedNaming(): IAllowedNaming {
    return {
      maxLength: 40,
      allowNamespace: true,
      customRegex: new RegExp(/^[A-Z_-\d/<> ]+$/i),
    };
  }

  public getDescription(): string | undefined {
    this.parse();
    return this.parsedXML?.description;
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
  }

  public getDataFile(): IFile | undefined {
    for (const f of this.getFiles()) {
      if (f.getFilename().includes(".data.")) {
        return f;
      }
    }
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

    this.parsedXML.description = parsed.abapGit["asx:abap"]["asx:values"].TEXT;

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }
}
