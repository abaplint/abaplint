import {IFile} from "../files/_ifile";
import {xmlToArray} from "../xml_utils";
import {AbstractObject} from "./_abstract_object";
import {IAllowedNaming} from "./_iobject";

export class WebMIME extends AbstractObject {
  private parsedXML: {
    description?: string,
    params: {[key: string]: string},
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

  public getParameter(name: string): string | undefined {
    this.parse();
    return this.parsedXML?.params[name.toLowerCase()];
  }

  public getParameters(): {[key: string]: string} {
    this.parse();
    return this.parsedXML?.params ?? {};
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
    this.parsedXML = {params: {}};
    const parsed = super.parseRaw2();

    if (parsed === undefined
        || parsed.abapGit === undefined
        || parsed.abapGit["asx:abap"]["asx:values"] === undefined) {
      return {updated: false, runtime: 0};
    }

    this.parsedXML.description = parsed.abapGit["asx:abap"]["asx:values"].TEXT;

    for (const param of xmlToArray(parsed.abapGit["asx:abap"]["asx:values"].PARAMS?.WWWPARAMS)) {
      this.parsedXML.params[param.NAME.toLowerCase()] = param.VALUE;
    }

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }
}
