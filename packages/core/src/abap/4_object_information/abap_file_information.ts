import {ClassDefinition} from "../types/class_definition";
import * as Structures from "../3_structures/structures";
import * as Expressions from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import {CurrentScope} from "../5_syntax/_current_scope";
import {IABAPFileInformation, InfoClassImplementation, InfoObjectDefinition, InfoMethodDefinition} from "./_abap_file_information";
import {StructureNode} from "../nodes";
import {InterfaceDefinition} from "../types";
import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {Identifier} from "./_identifier";
import * as Tokens from "../1_lexer/tokens";
import {Visibility} from "./visibility";

export class ABAPFileInformation implements IABAPFileInformation {
  private readonly classDefinitions: IClassDefinition[];
  private readonly interfaceDefinitions: IInterfaceDefinition[];

  private readonly interfaces: InfoObjectDefinition[];
  private readonly classes: InfoObjectDefinition[];
  private readonly forms: Identifier[];
  private readonly implementations: InfoClassImplementation[];
  private readonly filename: string;

  public constructor(structure: StructureNode | undefined, filename: string) {
    this.classDefinitions = [];
    this.interfaceDefinitions = [];

    this.forms = [];
    this.implementations = [];
    this.interfaces = [];
    this.classes = [];
    this.filename = filename;
    this.parse(structure);
  }

  public getClassDefinitions() {
    return this.classDefinitions;
  }

  public listClassImplementations(): readonly InfoClassImplementation[] {
    return this.implementations;
  }

  public listInterfaceDefinitions(): readonly InfoObjectDefinition[] {
    return this.interfaces;
  }

  public getInterfaceDefinitionByName(_name: string): InfoObjectDefinition | undefined {
    for (const i of this.listInterfaceDefinitions()) {
      if (i.name.getName().toUpperCase() === name) {
        return i;
      }
    }
    return undefined;
  }

  public listClassDefinitions(): readonly InfoObjectDefinition[] {
    return this.classes;
  }

  public getClassDefinitionByName(name: string): InfoObjectDefinition | undefined {
    for (const d of this.listClassDefinitions()) {
      if (d.name.getName().toUpperCase() === name) {
        return d;
      }
    }
    return undefined;
  }

  public getClassImplementationByName(name: string): InfoClassImplementation | undefined {
    for (const impl of this.listClassImplementations()) {
      if (impl.name.getName().toUpperCase() === name.toUpperCase()) {
        return impl;
      }
    }
    return undefined;
  }

  public getClassDefinition(name: string) {
    for (const def of this.getClassDefinitions()) {
      if (def.getName().toUpperCase() === name.toUpperCase()) {
        return def;
      }
    }
    return undefined;
  }

  public getInterfaceDefinitions() {
    return this.interfaceDefinitions;
  }

  public getInterfaceDefinition(name: string) {
    for (const def of this.getInterfaceDefinitions()) {
      if (def.getName().toUpperCase() === name.toUpperCase()) {
        return def;
      }
    }
    return undefined;
  }

  public listFormDefinitions(): Identifier[] {
    return this.forms;
  }

///////////////////////

  private parse(structure: StructureNode | undefined): void {
    const scope = CurrentScope.buildEmpty();

    if (structure !== undefined) {
      for (const found of structure.findAllStructures(Structures.ClassDefinition)) {
        this.classDefinitions.push(new ClassDefinition(found, this.filename, scope));
      }
      this.parseClasses(structure);

      for (const found of structure.findAllStructures(Structures.Interface)) {
        this.interfaceDefinitions.push(new InterfaceDefinition(found, this.filename, scope));
      }
      this.parseInterfaces(structure);

      for (const found of structure.findAllStructures(Structures.ClassImplementation)) {
        const methods = [];
        for (const method of found.findAllStructures(Structures.Method)) {
          const methodName = method.findFirstExpression(Expressions.MethodName)?.getFirstToken();
          if (methodName) {
            methods.push(new Identifier(methodName, this.filename));
          }
        }

        const name = found.findFirstStatement(Statements.ClassImplementation)!.findFirstExpression(Expressions.ClassName)!.getFirstToken();
        this.implementations.push({name: new Identifier(name, this.filename), methods});
      }

      for (const statement of structure.findAllStructures(Structures.Form)) {
        // FORMs can contain a dash in the name
        const pos = statement.findFirstExpression(Expressions.FormName)!.getFirstToken().getStart();
        const name = statement.findFirstExpression(Expressions.FormName)!.concatTokens();
        const nameToken = new Tokens.Identifier(pos, name);
        this.forms.push(new Identifier(nameToken, this.filename));
      }
    }
  }

  private parseInterfaces(structure: StructureNode) {
    for (const found of structure.findAllStructures(Structures.Interface)) {
      const interfaceName = found.findFirstStatement(Statements.Interface)!.findFirstExpression(Expressions.InterfaceName)!.getFirstToken();

      const methods: InfoMethodDefinition[] = [];
      for (const def of found.findAllStatements(Statements.MethodDef)) {
        const methodName = def.findFirstExpression(Expressions.MethodName)?.getFirstToken();
        if (methodName === undefined) {
          continue;
        }

        methods.push({
          name: new Identifier(methodName, this.filename),
          isRedefinition: false,
          visibility: Visibility.Public,
        });
      }

      this.interfaces.push({
        name: new Identifier(interfaceName, this.filename),
        isLocal: found.findFirstExpression(Expressions.Global) !== undefined,
        methods: methods,
        attributes: [], // todo
      });
    }
  }

  private parseClasses(structure: StructureNode) {
    for (const found of structure.findAllStructures(Structures.ClassDefinition)) {
      const className = found.findFirstStatement(Statements.ClassDefinition)!.findFirstExpression(Expressions.ClassName)!.getFirstToken();

      this.classes.push({
        name: new Identifier(className, this.filename),
        isLocal: found.findFirstExpression(Expressions.Global) !== undefined,
        methods: [], // todo
        attributes: [], // todo
      });
    }
  }

}