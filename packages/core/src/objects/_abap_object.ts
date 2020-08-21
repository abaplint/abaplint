import {AbstractObject} from "./_abstract_object";
import {ABAPFile} from "../files";
import {xmlToArray} from "../xml_utils";
import {ABAPParser} from "../abap/abap_parser";
import {Version} from "../version";
import {ISyntaxResult} from "../abap/5_syntax/_spaghetti_scope";
import {IParseResult} from "./_iobject";

export interface ITextElement {
  key: string;
  text: string;
}

export abstract class ABAPObject extends AbstractObject {
  private parsed: readonly ABAPFile[];
  protected texts: ITextElement[] | undefined;
  public syntaxResult: ISyntaxResult | undefined; // do not use this outside of SyntaxLogic class, todo: refactor

  abstract getSequencedFiles(): readonly ABAPFile[];

  public constructor(name: string) {
    super(name);
    this.parsed = [];
    this.texts = undefined;
  }

  public static is(x: any): x is ABAPObject{
    return !!x && x instanceof ABAPObject;
  }

  public parse(version: Version, globalMacros: readonly string[] | undefined): IParseResult {
    if (this.isDirty() === false) {
      return {updated: false, runtime: 0};
    }

    const abapFiles = this.files.filter(f => f.getFilename().endsWith(".abap"));
    const result = new ABAPParser(version, globalMacros).parse(abapFiles);

    this.parsed = result.output;
    this.old = result.issues;
    this.dirty = false;

    return {updated: true, runtime: result.runtime};
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
    const search = this.getName().replace(/\//g, "#").toLowerCase() + "." + this.getType().toLowerCase() + ".abap";
    for (const file of this.getABAPFiles()) {
      if (file.getFilename().endsWith(search)) {
        return file;
      }
    }
    return undefined;
  }

  public getTexts(): readonly ITextElement[] {
    if (this.texts === undefined) {
      this.findTexts(this.parseRaw());
    }
    return this.texts!;
  }

  protected findTexts(parsed: any) {
    this.texts = [];

    if (parsed?.abapGit["asx:abap"]["asx:values"]?.TPOOL?.item === undefined) {
      return;
    }

    for (const t of xmlToArray(parsed.abapGit["asx:abap"]["asx:values"].TPOOL.item)) {
      if (t?.ID?._text === "I") {
        if (t.KEY === undefined || t.ENTRY === undefined) {
          throw new Error("findTexts, undefined");
        }
        this.texts.push({
          key: t.KEY._text,
          text: t.ENTRY._text});
      }
    }
  }

}