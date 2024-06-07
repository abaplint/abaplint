import {IFilenameAndToken, IMacroReferences} from "./_imacro_references";
import {AbstractToken} from "./abap/1_lexer/tokens/abstract_token";

export class MacroReferences implements IMacroReferences {
  private readonly definitions: {[index: string]: IFilenameAndToken[]} = {};
  private readonly references: {[index: string]: IFilenameAndToken[]} = {};

  public addDefinition(ref: IFilenameAndToken): void {
    if (this.definitions[ref.filename] === undefined) {
      this.definitions[ref.filename] = [];
    } else if (this.definitions[ref.filename].find((d) => d.token.getStart().equals(ref.token.getStart()))) {
      return;
    }
    this.definitions[ref.filename].push(ref);
  }

  public addReference(ref: IFilenameAndToken): void {
    if (this.references[ref.filename] === undefined) {
      this.references[ref.filename] = [];
    }
    this.references[ref.filename].push(ref);
  }

  public listDefinitionsByFile(filename: string): IFilenameAndToken[] {
    return this.definitions[filename] || [];
  }

  public listUsagesbyMacro(filename: string, token: AbstractToken): IFilenameAndToken[] {
    const ret: IFilenameAndToken[] = [];
    const tokenStr = token.getStr().toUpperCase();

    for (const ref of this.references[filename] || []) {
      if (ref.token.getStr().toUpperCase() === tokenStr) {
        ret.push(ref);
      }
    }
    return ret;
  }

  public clear(filename: string): void {
    delete this.definitions[filename];
    delete this.references[filename];
  }

}