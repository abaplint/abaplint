import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";

export class ICFService extends AbstractObject {
  private parsedXML: {
    url?: string,
    handlers?: string[] | undefined,
  } | undefined;

  public getType(): string {
    return "SICF";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 100,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public getURL(): string | undefined {
    this.parse();
    return this.parsedXML?.url;
  }

  public getHandlerList(): string[] | undefined {
    this.parse();
    return this.parsedXML?.handlers;
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

    const table = parsed.abapGit["asx:abap"]["asx:values"].ICFHANDLER_TABLE;
    this.parsedXML.handlers = [];
    for (const h of xmlToArray(table)) {
      if (h.ICFHANDLER !== undefined) {
        this.parsedXML.handlers.push(h.ICFHANDLER.ICFHANDLER);
      }
    }

    this.parsedXML.url = parsed.abapGit["asx:abap"]["asx:values"].URL;

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }

}