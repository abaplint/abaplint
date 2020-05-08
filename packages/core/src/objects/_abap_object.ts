import {AbstractObject} from "./_abstract_object";
import {ABAPFile} from "../files";
import {xmlToArray} from "../xml_utils";
import {ABAPParser} from "../abap/abap_parser";
import {IClassDefinition} from "../abap/types/_class_definition";
import {IClassImplementation} from "../abap/types/_class_implementation";
import {IObject} from "./_iobject";
import {Version} from "../version";

const tag = Symbol("ABAPObject");
export interface ITextElement {
  key: string;
  text: string;
}

export abstract class ABAPObject extends AbstractObject {
  private parsed: readonly ABAPFile[];
  private [tag] = true;

  public constructor(name: string) {
    super(name);
    this.parsed = [];
  }

  public static is(x:any):x is ABAPObject // silly overload to remove unused warning
  // eslint-disable-next-line no-dupe-class-members
  public static is(x:ABAPObject):x is ABAPObject{
    return !!x?.[tag];
  }

  public parse(version: Version, globalMacros: readonly string[] | undefined): IObject {
    if (this.isDirty() === false) {
      return this;
    }

    const abapFiles = this.files.filter(f => f.getFilename().endsWith(".abap"));
    const results = new ABAPParser(version, globalMacros).parse(abapFiles);

    this.parsed = results.output;
    this.old = results.issues;
    this.dirty = false;

    return this;
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

  public getClassImplementation(name: string): IClassImplementation | undefined {
    for (const impl of this.getClassImplementations()) {
      if (impl.getName().toUpperCase() === name.toUpperCase()) {
        return impl;
      }
    }
    return undefined;
  }

  public getClassImplementations(): readonly IClassImplementation[] {
    let ret: IClassImplementation[] = [];
    for (const file of this.getABAPFiles()) {
      ret = ret.concat(file.getInfo().getClassImplementations());
    }
    return ret;
  }

  public getClassDefinitions(): readonly IClassDefinition[] {
    let ret: IClassDefinition[] = [];
    for (const file of this.getABAPFiles()) {
      ret = ret.concat(file.getInfo().getClassDefinitions());
    }
    return ret;
  }

  public getClassDefinition(name: string): IClassDefinition | undefined {
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