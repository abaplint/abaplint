import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";

export class Transaction extends AbstractObject {
  private parsedXML: {
    description?: string,
    programName?: string,
    cinfo?: string,
    textsTranslations?: {language: string, description?: string}[],
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

  public getTextsTranslations() {
    this.parse();
    return this.parsedXML?.textsTranslations;
  }

  public parse() {
    if (this.parsedXML) {
      return {updated: false, runtime: 0};
    }

    const start = Date.now();
    this.parsedXML = {};
    const parsed = super.parseRaw2();
    const values = parsed?.abapGit?.["asx:abap"]?.["asx:values"];
    if (values === undefined) {
      return {updated: false, runtime: 0};
    }

    this.parsedXML.description = values.TSTCT?.TTEXT;
    this.parsedXML.programName = values.TSTC?.PGMNA;
    this.parsedXML.cinfo = values.TSTC?.CINFO;

    this.parsedXML.textsTranslations = [];
    for (const item of xmlToArray(values.I18N_TPOOL?.TSTCT)) {
      this.parsedXML.textsTranslations.push({language: item.SPRSL, description: item.TTEXT});
    }

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }
}
