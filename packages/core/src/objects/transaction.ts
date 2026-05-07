import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";

export class Transaction extends AbstractObject {
  private parsedXML: {
    description?: string,
    programName?: string,
    cinfo?: string,
    translationTexts?: {language: string, description?: string}[],
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

  public getCInfo(): string | undefined {
    this.parse();
    return this.parsedXML?.cinfo;
  }

  public getProgramName(): string | undefined {
    this.parse();
    return this.parsedXML?.programName;
  }

  public getDescription(): string | undefined {
    this.parse();
    return this.parsedXML?.description;
  }

  public getTranslationTexts() {
    this.parse();
    return this.parsedXML?.translationTexts;
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

    this.parsedXML.description = parsed.abapGit["asx:abap"]["asx:values"].TSTCT?.TTEXT;
    this.parsedXML.programName = parsed.abapGit["asx:abap"]["asx:values"].TSTC?.PGMNA;
    this.parsedXML.cinfo = parsed.abapGit["asx:abap"]["asx:values"].TSTC?.CINFO;

    this.parsedXML.translationTexts = [];
    for (const item of xmlToArray(parsed.abapGit["asx:abap"]["asx:values"].I18N_TPOOL?.TSTCT)) {
      this.parsedXML.translationTexts.push({language: item.SPRSL, description: item.TTEXT});
    }

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }
}