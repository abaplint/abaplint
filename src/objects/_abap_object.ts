import {AbstractObject} from "./_abstract_object";
import {ABAPFile} from "../files";
import {Issue} from "../issue";
import {ClassImplementation, ClassDefinition} from "../abap/types";
import {xmlToArray} from "../xml_utils";
import {ABAPParser} from "../abap/abap_parser";
import {IConfiguration} from "../_config";

export interface ITextElement {
  key: string;
  text: string;
}

export abstract class ABAPObject extends AbstractObject {
  private parsed: readonly ABAPFile[];
  private old: readonly Issue[];

  public constructor(name: string) {
    super(name);
    this.parsed = [];
  }

  private shouldParse(): boolean {
  // todo, this does not handle changing of version + macros
    if (this.parsed.length > 0 && this.isDirty() === false) {
      return false;
    } else {
      return true;
    }
  }

  public parse(config: IConfiguration): readonly Issue[] {
    if (this.shouldParse() === false) {
      return this.old;
    }

    const abapFiles = this.files.filter(f => f.getFilename().endsWith(".abap"));
    const results = new ABAPParser(config.getVersion(), config.getSyntaxSetttings().globalMacros).parse(abapFiles);

    this.parsed = results.output;
    this.old = results.issues;
    this.dirty = false;

    return results.issues;
  }

  public getABAPFiles(): readonly ABAPFile[] {
    return this.parsed;
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

  public getClassImplementation(name: string): ClassImplementation | undefined {
    for (const impl of this.getClassImplementations()) {
      if (impl.getName().toUpperCase() === name.toUpperCase()) {
        return impl;
      }
    }
    return undefined;
  }

  public getClassImplementations(): readonly ClassImplementation[] {
    let ret: ClassImplementation[] = [];
    for (const file of this.getABAPFiles()) {
      ret = ret.concat(file.getClassImplementations());
    }
    return ret;
  }

  public getClassDefinitions(): readonly ClassDefinition[] {
    let ret: ClassDefinition[] = [];
    for (const file of this.getABAPFiles()) {
      ret = ret.concat(file.getClassDefinitions());
    }
    return ret;
  }

  public getClassDefinition(name: string): ClassDefinition | undefined {
    for (const impl of this.getClassDefinitions()) {
      if (impl.getName().toUpperCase() === name.toUpperCase()) {
        return impl;
      }
    }
    return undefined;
  }

  public getTexts(): readonly ITextElement[] {
    const parsed = this.parseXML();
    return this.findTexts(parsed);
  }

  public findTexts(parsed: any): readonly ITextElement[] {
    if (parsed === undefined
        || parsed.abapGit["asx:abap"]["asx:values"] === undefined
        || parsed.abapGit["asx:abap"]["asx:values"].TPOOL === undefined
        || parsed.abapGit["asx:abap"]["asx:values"].TPOOL.item === undefined) {
      return [];
    }

    const ret: ITextElement[] = [];
    for (const t of xmlToArray(parsed.abapGit["asx:abap"]["asx:values"].TPOOL.item)) {
      if (t.ID !== undefined && t.ID._text === "I") {
        ret.push({
          key: t.KEY._text,
          text: t.ENTRY._text});
      }
    }

    return ret;
  }

}