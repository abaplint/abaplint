import {AbstractObject} from "./_abstract_object";
import {xmlToArray, unescape} from "../xml_utils";
import {ABAPParser} from "../abap/abap_parser";
import {ABAPRelease, LanguageVersion} from "../version";
import {ISyntaxResult} from "../abap/5_syntax/_spaghetti_scope";
import {IParseResult} from "./_iobject";
import {ABAPFile} from "../abap/abap_file";
import {IRegistry} from "../_iregistry";

export interface ITextElements {[key: string]: {entry: string, maxLength: number}}
export interface ITranslationTextElements {language: string, textElements: ITextElements}

export abstract class ABAPObject extends AbstractObject {
  private parsed: readonly ABAPFile[];
  protected texts: {[id: string]: ITextElements} | undefined;
  private textsTranslations: ITranslationTextElements[] | undefined;
  private rawXMLCache: any | undefined;
  public syntaxResult: ISyntaxResult | undefined; // do not use this outside of SyntaxLogic class, todo: refactor

  public [Symbol.for("debug.description")](){
    return `${this.constructor.name} ${this.getName()}`;
  }
  public abstract getSequencedFiles(): readonly ABAPFile[];
  public abstract getDescription(): string | undefined;

  public constructor(name: string) {
    super(name);
    this.parsed = [];
    this.texts = undefined;
    this.rawXMLCache = undefined;
  }

  public static is(x: any): x is ABAPObject {
    return !!x && x instanceof ABAPObject;
  }

  public parse(release: ABAPRelease, globalMacros?: readonly string[], reg?: IRegistry,
               languageVersion: LanguageVersion = LanguageVersion.Normal): IParseResult {
    if (this.isDirty() === false) {
      return {updated: false, runtime: 0};
    }

    const abapFiles = this.getFiles().filter(f => f.getFilename().endsWith(".abap"));
    const result = new ABAPParser({release, globalMacros, reg, languageVersion}).parse(abapFiles);

    this.parsed = result.output;
    this.old = result.issues;
    this.dirty = false;

    return {updated: true, runtime: result.runtime, runtimeExtra: result.runtimeExtra};
  }

  public setDirty(): void {
    this.syntaxResult = undefined;
    this.texts = undefined;
    this.textsTranslations = undefined;
    this.rawXMLCache = undefined;
    this.parsed = [];
    super.setDirty();
  }

  private getParsedXML(): any | undefined {
    if (this.rawXMLCache === undefined) {
      this.rawXMLCache = this.parseRaw2() ?? null;
    }
    return this.rawXMLCache ?? undefined;
  }

  public getABAPFiles(): readonly ABAPFile[] {
    return this.parsed;
  }

  public getABAPFileByName(filename: string): ABAPFile | undefined {
    for (const p of this.parsed) {
      if (p.getFilename() === filename) {
        return p;
      }
    }
    return undefined;
  }

  public getMainABAPFile(): ABAPFile | undefined {
    // todo, uris, https://github.com/abaplint/abaplint/issues/673
    const search = this.getName().replace(/\//g, "#").toLowerCase() + "." + this.getType().toLowerCase() + ".abap";
    for (const file of this.getABAPFiles()) {
      if (file.getFilename().endsWith(search)) {
        return file;
      }
    }
    // uri fallback,
    for (const file of this.getABAPFiles()) {
      if (file.getFilename().includes(".prog.screen_")) {
        continue;
      } else if (file.getFilename().endsWith(".abap")) {
        return file;
      }
    }
    return undefined;
  }

  public getTextSymbols(): ITextElements {
    if (this.texts === undefined) {
      this.findTexts(this.getParsedXML());
    }
    return this.texts!["I"] ?? {};
  }

  public getTextElements(): ITextElements {
    if (this.texts === undefined) {
      this.findTexts(this.getParsedXML());
    }
    const result: ITextElements = {};
    for (const elements of Object.values(this.texts!)) {
      Object.assign(result, elements);
    }
    return result;
  }

  public getTextElementsTranslations(): ITranslationTextElements[] {
    if (this.textsTranslations === undefined) {
      this.findTextsTranslations(this.getParsedXML());
    }
    return this.textsTranslations!;
  }

  protected findTexts(parsed: any) {
    this.texts = {};

    if (parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.TPOOL?.item === undefined) {
      return;
    }

    for (const t of xmlToArray(parsed.abapGit["asx:abap"]["asx:values"].TPOOL.item)) {
      const id = t.ID?.toUpperCase();
      if (id === undefined) {
        continue;
      }

      if (id !== "R" && t.KEY === undefined) {
        continue;
      }

      const key = (t.KEY ?? t.ID)?.toUpperCase();
      if (key === undefined) {
        continue;
      }
      if (this.texts[id] === undefined) {
        this.texts[id] = {};
      }
      this.texts[id][key] = {entry: t.ENTRY ? unescape(t.ENTRY) : "", maxLength: parseInt(t.LENGTH, 10)};
    }
  }

  private findTextsTranslations(parsed: any): void {
    this.textsTranslations = [];

    const values = parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.I18N_TPOOL?.item;
    if (values === undefined) {
      return;
    }

    for (const langItem of xmlToArray(values)) {
      const textElements: ITextElements = {};
      for (const item of xmlToArray(langItem.TEXTPOOL?.item)) {
        const key = (item.KEY ?? item.ID)?.toUpperCase();
        if (key !== undefined) {
          textElements[key] = {entry: unescape(item.ENTRY), maxLength: parseInt(item.LENGTH, 10)};
        }
      }
      this.textsTranslations.push({language: langItem.LANGUAGE, textElements});
    }
  }

}
