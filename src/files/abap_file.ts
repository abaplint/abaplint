import {Pragma} from "../abap/tokens";
import {Token} from "../abap/tokens/_token";
import {AbstractFile} from "./_abstract_file";
import {IFile} from "./_ifile";
import {StructureNode, StatementNode} from "../abap/nodes/";
import * as Structures from "../abap/structures";
import {ClassDefinition, ClassImplementation, InterfaceDefinition, FormDefinition} from "../abap/types";

export class ABAPFile extends AbstractFile {
  // tokens vs statements: pragmas are part of tokens but not in statements
  // todo: need some better way of handling pragmas
  private readonly tokens: Token[];
  private statements: StatementNode[];
  private structure: StructureNode | undefined;
  private readonly file: IFile;

  public constructor(file: IFile, tokens: Token[], statements: StatementNode[]) {
    super(file.getFilename());
    this.file       = file;
    this.tokens     = tokens;
    this.statements = statements;
  }

  public getRaw(): string {
    return this.file.getRaw();
  }

  public getRawRows(): string[] {
    return this.file.getRawRows();
  }

  public setStructure(node?: StructureNode) {
    this.structure = node;
  }

  public getStructure(): StructureNode | undefined {
    return this.structure;
  }

  public getTokens(withPragmas = true): Token[] {
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

  public getStatements(): StatementNode[] {
    return this.statements;
  }

  public setStatements(s: StatementNode[]): void {
    this.statements = s;
  }

// **************************

  public getInterfaceDefinitions(): InterfaceDefinition[] {
    if (this.structure === undefined) {
      return [];
    }
    const ret: InterfaceDefinition[] = [];
    for (const found of this.structure.findAllStructures(Structures.Interface)) {
      ret.push(new InterfaceDefinition(found));
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
      ret.push(new ClassDefinition(found));
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
      ret.push(new ClassImplementation(found));
    }
    return ret;
  }

  public getFormDefinitions(): FormDefinition[] {
    if (this.structure === undefined) {
      return [];
    }
    const ret: FormDefinition[] = [];
    for (const found of this.structure.findAllStructures(Structures.Form)) {
      ret.push(new FormDefinition(found));
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