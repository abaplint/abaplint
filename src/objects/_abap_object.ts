import {AbstractObject} from "./_abstract_object";
import {ABAPFile} from "../files";
import {Lexer} from "../abap/lexer";
import {StatementParser} from "../abap/statement_parser";
import {StructureParser} from "../abap/structure_parser";
import {Registry} from "../registry";
import {Issue} from "../issue";
import {ClassImplementation} from "../abap/types";

export abstract class ABAPObject extends AbstractObject {
  private parsed: ABAPFile[];
  private old: Issue[];

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

  public parseFirstPass(reg: Registry) {
    if (this.shouldParse() === false) {
      return;
    }
    this.parsed = [];

    for (const file of this.files) {
      if (file.getFilename().endsWith(".abap")) {
        const tokens = Lexer.run(file);
        const statements = StatementParser.run(tokens, reg.getConfig());
        this.parsed.push(new ABAPFile(file, tokens, statements));
      }
    }

  }

// runs StructureParser
// todo: this can actually be refactored into a single pass?
  public parseSecondPass(): Issue[] {
    if (this.shouldParse() === false) {
      return this.old;
    }

    let ret: Issue[] = [];
    for (const f of this.parsed) {
      const result = StructureParser.run(f);
      f.setStructure(result.node);
      ret = ret.concat(result.issues);
    }

    this.dirty = false;
    this.old = ret;

    return ret;
  }

  public getABAPFiles(): ABAPFile[] {
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

  public getClassImplementations(): ClassImplementation[] {
    let ret: ClassImplementation[] = [];
    for (const file of this.getABAPFiles()) {
      ret = ret.concat(file.getClassImplementations());
    }
    return ret;
  }

}