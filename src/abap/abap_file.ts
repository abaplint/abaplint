import {Pragma} from "./1_lexer/tokens";
import {Token} from "./1_lexer/tokens/_token";
import {AbstractFile} from "../files/_abstract_file";
import {IFile} from "../files/_ifile";
import {StructureNode, StatementNode} from "./nodes";
import * as Structures from "./3_structures/structures";
import {ClassDefinition, ClassImplementation, InterfaceDefinition, FormDefinition} from "./types";

export class ABAPFile extends AbstractFile {
  private readonly tokens: readonly Token[];
  private readonly statements: readonly StatementNode[];
  private readonly structure: StructureNode | undefined;
  private readonly file: IFile;

  public constructor(file: IFile, tokens: readonly Token[], statements: readonly StatementNode[], structure: StructureNode | undefined) {
    super(file.getFilename());
    this.file       = file;
    this.tokens     = tokens;
    this.statements = statements;
    this.structure  = structure;
  }

  public getRaw(): string {
    return this.file.getRaw();
  }

  public getRawRows(): string[] {
    return this.file.getRawRows();
  }

  public getStructure(): StructureNode | undefined {
    return this.structure;
  }

  public getTokens(withPragmas = true): readonly Token[] {
    if (withPragmas === true) {
      return this.tokens;
    } else {
      const tokens: Token[] = [];
      this.tokens.forEach((t) => {
        if (!(t instanceof Pragma)) {
          tokens.push(t);
        }
      });
      return tokens;
    }
  }

  public getStatements(): readonly StatementNode[] {
    return this.statements;
  }

// **************************

  public getInterfaceDefinitions(): InterfaceDefinition[] {
    if (this.structure === undefined) {
      return [];
    }
    const ret: InterfaceDefinition[] = [];
    for (const found of this.structure.findAllStructures(Structures.Interface)) {
      ret.push(new InterfaceDefinition(found, this.getFilename()));
    }
    return ret;
  }

  public getInterfaceDefinition(name: string): InterfaceDefinition | undefined {
    for (const def of this.getInterfaceDefinitions()) {
      if (def.getName().toUpperCase() === name.toUpperCase()) {
        return def;
      }
    }
    return undefined;
  }

  public getClassDefinitions(): ClassDefinition[] {
    if (this.structure === undefined) {
      return [];
    }
    const ret: ClassDefinition[] = [];
    for (const found of this.structure.findAllStructures(Structures.ClassDefinition)) {
      ret.push(new ClassDefinition(found, this.getFilename()));
    }
    return ret;
  }

  public getClassDefinition(name: string): ClassDefinition | undefined {
    for (const def of this.getClassDefinitions()) {
      if (def.getName().toUpperCase() === name.toUpperCase()) {
        return def;
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
    if (this.structure === undefined) {
      return [];
    }
    const ret: ClassImplementation[] = [];
    for (const found of this.structure.findAllStructures(Structures.ClassImplementation)) {
      ret.push(new ClassImplementation(found, this.getFilename()));
    }
    return ret;
  }

  public getFormDefinitions(): FormDefinition[] {
    if (this.structure === undefined) {
      return [];
    }
    const ret: FormDefinition[] = [];
    for (const found of this.structure.findAllStructures(Structures.Form)) {
      ret.push(new FormDefinition(found, this.getFilename()));
    }
    return ret;
  }

  public getFormDefinition(name: string): FormDefinition | undefined {
    for (const def of this.getFormDefinitions()) {
      if (def.getName().toUpperCase() === name.toUpperCase()) {
        return def;
      }
    }
    return undefined;
  }

}