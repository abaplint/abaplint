import {AbstractObject} from "./_abstract_object";
import {xmlToArray, unescape} from "../xml_utils";
import {ABAPParser} from "../abap/abap_parser";
import {Version} from "../version";
import {ISyntaxResult} from "../abap/5_syntax/_spaghetti_scope";
import {IParseResult} from "./_iobject";
import {ABAPFile} from "../abap/abap_file";
import {IRegistry} from "../_iregistry";

export interface ITextElements {[key: string]: {entry: string, maxLength: number}}
export interface ITranslationTextElements {language: string, textElements: ITextElements}

export abstract class ABAPObject extends AbstractObject {
  private parsed: readonly ABAPFile[];
  protected texts: {[id: string]: ITextElements} | undefined;
  private translationTextElements: ITranslationTextElements[] | undefined;
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
  }

  public static is(x: any): x is ABAPObject {
    return !!x && x instanceof ABAPObject;
  }

  public parse(version: Version, globalMacros?: readonly string[], reg?: IRegistry): IParseResult {
    if (this.isDirty() === false) {
      return {updated: false, runtime: 0};
    }

    const abapFiles = this.getFiles().filter(f => f.getFilename().endsWith(".abap"));
    const result = new ABAPParser(version, globalMacros, reg).parse(abapFiles);

    this.parsed = result.output;
    this.old = result.issues;
    this.dirty = false;

    return {updated: true, runtime: result.runtime, runtimeExtra: result.runtimeExtra};
  }

  public setDirty(): void {
    this.syntaxResult = undefined;
    this.texts = undefined;
    this.translationTextElements = undefined;
    this.parsed = [];
    super.setDirty();
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
      this.findTexts(this.parseRaw2());
    }
    return this.texts!["I"] ?? {};
  }

  public getTextElements(): ITextElements {
    if (this.texts === undefined) {
      this.findTexts(this.parseRaw2());
    }
    const result: ITextElements = {};
    for (const elements of Object.values(this.texts!)) {
      Object.assign(result, elements);
    }
    return result;
  }

  public getTranslationTextElements(): ITranslationTextElements[] {
    if (this.translationTextElements === undefined) {
      this.parseTranslationTextElements();
    }
    return this.translationTextElements!;
  }

  protected findTexts(parsed: any) {
    this.texts = {};

    if (parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.TPOOL?.item === undefined) {
      return;
    }

    for (const t of xmlToArray(parsed.abapGit["asx:abap"]["asx:values"].TPOOL.item)) {
      const id = t.ID?.toUpperCase();
      if (id === undefined
        || (id !== "R" && t.KEY === undefined)
      ) {
        throw new Error("findTexts, undefined");
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

  private parseTranslationTextElements(): void {
    this.translationTextElements = [];

    const values = this.parseRaw2()?.abapGit?.["asx:abap"]?.["asx:values"];
    if (values === undefined) {
      return;
    }

    for (const langItem of xmlToArray(values.I18N_TPOOL?.item)) {
      const textElements: ITextElements = {};
      for (const item of xmlToArray(langItem.TEXTPOOL?.item)) {
        const key = (item.KEY ?? item.ID)?.toUpperCase();
        if (key !== undefined) {
          textElements[key] = {entry: unescape(item.ENTRY), maxLength: parseInt(item.LENGTH, 10)};
        }
      }
      this.translationTextElements.push({language: langItem.LANGUAGE, textElements});
    }
  }

}