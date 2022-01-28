import {AbstractObject} from "./_abstract_object";
import {xmlToArray, unescape} from "../xml_utils";
import {ABAPParser} from "../abap/abap_parser";
import {Version} from "../version";
import {ISyntaxResult} from "../abap/5_syntax/_spaghetti_scope";
import {IParseResult} from "./_iobject";
import {ABAPFile} from "../abap/abap_file";

export interface ITextElements {[key: string]: string}

export abstract class ABAPObject extends AbstractObject {
  private parsed: readonly ABAPFile[];
  protected texts: ITextElements | undefined;
  public syntaxResult: ISyntaxResult | undefined; // do not use this outside of SyntaxLogic class, todo: refactor

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

  public parse(version: Version, globalMacros?: readonly string[]): IParseResult {
    if (this.isDirty() === false) {
      return {updated: false, runtime: 0};
    }

    const abapFiles = this.getFiles().filter(f => f.getFilename().endsWith(".abap"));
    const result = new ABAPParser(version, globalMacros).parse(abapFiles);

    this.parsed = result.output;
    this.old = result.issues;
    this.dirty = false;

    return {updated: true, runtime: result.runtime, runtimeExtra: result.runtimeExtra};
  }

  public setDirty(): void {
    this.syntaxResult = undefined;
    this.texts = undefined;
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
      if (file.getFilename().endsWith(".abap")) {
        return file;
      }
    }
    return undefined;
  }

  public getTexts(): ITextElements {
    if (this.texts === undefined) {
      this.findTexts(this.parseRaw2());
    }
    return this.texts!;
  }

  protected findTexts(parsed: any) {
    this.texts = {};

    if (parsed?.abapGit["asx:abap"]["asx:values"]?.TPOOL?.item === undefined) {
      return;
    }

    for (const t of xmlToArray(parsed.abapGit["asx:abap"]["asx:values"].TPOOL.item)) {
      if (t?.ID === "I") {
        if (t.KEY === undefined) {
          throw new Error("findTexts, undefined");
        }
        const key = t.KEY;
        if (key === undefined) {
          continue;
        }
        this.texts[key.toUpperCase()] = t.ENTRY ? unescape(t.ENTRY) : "";
      }
    }
  }

}