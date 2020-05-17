import {ClassDefinition} from "../types/class_definition";
import * as Structures from "../3_structures/structures";
import * as Expressions from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import {CurrentScope} from "../5_syntax/_current_scope";
import {IABAPFileInformation, InfoClassImplementation, InfoClassDefinition, InfoMethodDefinition, InfoInterfaceDefinition, InfoAttribute, InfoAlias, AttributeType} from "./_abap_file_information";
import {StructureNode} from "../nodes";
import {InterfaceDefinition} from "../types";
import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {Identifier} from "./_identifier";
import * as Tokens from "../1_lexer/tokens";
import {Visibility} from "./visibility";

export class ABAPFileInformation implements IABAPFileInformation {
  private readonly classDefinitions: IClassDefinition[]; // todo, remove
  private readonly interfaceDefinitions: IInterfaceDefinition[]; // todo, remove

  private readonly interfaces: InfoInterfaceDefinition[];
  private readonly classes: InfoClassDefinition[];
  private readonly forms: Identifier[];
  private readonly implementations: InfoClassImplementation[];
  private readonly filename: string;

  public constructor(structure: StructureNode | undefined, filename: string) {
    this.classDefinitions = []; // todo, remove
    this.interfaceDefinitions = []; // todo, remove

    this.forms = [];
    this.implementations = [];
    this.interfaces = [];
    this.classes = [];
    this.filename = filename;
    this.parse(structure);
  }

  // TODO, DELETE
  public getClassDefinitions() {
    return this.classDefinitions;
  }
  // TODO, DELETE
  public getInterfaceDefinitions() {
    return this.interfaceDefinitions;
  }

  public listClassImplementations(): readonly InfoClassImplementation[] {
    return this.implementations;
  }

  public listInterfaceDefinitions(): readonly InfoInterfaceDefinition[] {
    return this.interfaces;
  }

  public getInterfaceDefinitionByName(name: string): InfoInterfaceDefinition | undefined {
    for (const i of this.listInterfaceDefinitions()) {
      if (i.identifier.getName().toUpperCase() === name.toUpperCase()) {
        return i;
      }
    }
    return undefined;
  }

  public listClassDefinitions(): readonly InfoClassDefinition[] {
    return this.classes;
  }

  public getClassDefinitionByName(name: string): InfoClassDefinition | undefined {
    for (const d of this.listClassDefinitions()) {
      if (d.identifier.getName().toUpperCase() === name.toUpperCase()) {
        return d;
      }
    }
    return undefined;
  }

  public getClassImplementationByName(name: string): InfoClassImplementation | undefined {
    for (const impl of this.listClassImplementations()) {
      if (impl.identifier.getName().toUpperCase() === name.toUpperCase()) {
        return impl;
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
        this.implementations.push({
          name: name.getStr(),
          identifier: new Identifier(name, this.filename),
          methods});
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
      const methods = this.parseMethodDefinition(found, Visibility.Public);
      const attributes = this.parseAttributes(found, Visibility.Public);

      this.interfaces.push({
        name: interfaceName.getStr(),
        identifier: new Identifier(interfaceName, this.filename),
        isLocal: found.findFirstExpression(Expressions.Global) === undefined,
        isGlobal: found.findFirstExpression(Expressions.Global) !== undefined,
        methods,
        attributes,
      });
    }
  }

  private parseClasses(structure: StructureNode) {
    for (const found of structure.findAllStructures(Structures.ClassDefinition)) {
      const className = found.findFirstStatement(Statements.ClassDefinition)!.findFirstExpression(Expressions.ClassName)!.getFirstToken();

      let methods = this.parseMethodDefinition(found.findFirstStructure(Structures.PublicSection), Visibility.Public);
      methods = methods.concat(this.parseMethodDefinition(found.findFirstStructure(Structures.ProtectedSection), Visibility.Protected));
      methods = methods.concat(this.parseMethodDefinition(found.findFirstStructure(Structures.PrivateSection), Visibility.Private));

      let attributes = this.parseAttributes(found.findFirstStructure(Structures.PublicSection), Visibility.Public);
      attributes = attributes.concat(this.parseAttributes(found.findFirstStructure(Structures.ProtectedSection), Visibility.Protected));
      attributes = attributes.concat(this.parseAttributes(found.findFirstStructure(Structures.PrivateSection), Visibility.Private));

      let aliases = this.parseAliases(found.findFirstStructure(Structures.PublicSection), Visibility.Public);
      aliases = aliases.concat(this.parseAliases(found.findFirstStructure(Structures.ProtectedSection), Visibility.Protected));
      aliases = aliases.concat(this.parseAliases(found.findFirstStructure(Structures.PrivateSection), Visibility.Private));

      const superClassName = found.findFirstExpression(Expressions.SuperClassName)?.getFirstToken().getStr();
      const isException = (superClassName?.match(/^.?cx_.*$/i) || superClassName?.match(/^\/.+\/cx_.*$/i)) ? true : false;

      this.classes.push({
        name: className.getStr(),
        identifier: new Identifier(className, this.filename),
        isLocal: found.findFirstExpression(Expressions.Global) === undefined,
        isGlobal: found.findFirstExpression(Expressions.Global) !== undefined,
        methods,
        superClassName,
        interfaces: this.getImplementing(found),
        isException,
        isForTesting: found.findFirstStatement(Statements.ClassDefinition)!.concatTokens().toUpperCase().includes(" FOR TESTING"),
        isAbstract: found.findFirstStatement(Statements.ClassDefinition)!.concatTokens().toUpperCase().includes(" ABSTRACT"),
        isFinal: found.findFirstExpression(Expressions.ClassFinal) !== undefined,
        aliases,
        attributes,
      });
    }
  }

///////////////////

  private getImplementing(input: StructureNode): {name: string, partial: boolean}[] {
    const ret: {name: string, partial: boolean}[] = [];
    for (const node of input.findAllStatements(Statements.InterfaceDef)) {
      const partial = node.concatTokens().toUpperCase().includes("PARTIALLY IMPLEMENTED");
      const name = node.findFirstExpression(Expressions.InterfaceName)!.getFirstToken().getStr().toUpperCase();
      ret.push({name, partial});
    }
    return ret;
  }

  private parseAliases(node: StructureNode | undefined, visibility: Visibility): InfoAlias[] {
    if (node === undefined) {
      return [];
    }

    const ret: InfoAlias[] = [];
    for (const a of node.findAllStatements(Statements.Aliases)) {
      const name = a.findFirstExpression(Expressions.SimpleName)!.getFirstToken();
      const comp = a.findFirstExpression(Expressions.Field)!.getFirstToken();

      ret.push({
        name: name.getStr(),
        identifier: new Identifier(name, this.filename),
        visibility,
        component: comp.getStr(),
      });
    }

    return ret;
  }

  private parseAttributes(node: StructureNode | undefined, visibility: Visibility): InfoAttribute[] {
    if (node === undefined) {
      return [];
    }

    const contents = node.findFirstStructure(Structures.SectionContents);
    if (contents === undefined) {
      return [];
    }

    const ret: InfoAttribute[] = [];
    for (const d of contents.findDirectStatements(Statements.Data)) {
      const name = d.findFirstExpression(Expressions.NamespaceSimpleName)!.getFirstToken();
      ret.push({
        name: name.getStr(),
        identifier: new Identifier(name, this.filename),
        type: AttributeType.Instance,
        readOnly: d.concatTokens().toUpperCase().includes(" READ-ONLY"),
        visibility,
      });
    }
    for (const d of contents.findDirectStatements(Statements.ClassData)) {
      const name = d.findFirstExpression(Expressions.NamespaceSimpleName)!.getFirstToken();
      ret.push({
        name: name.getStr(),
        identifier: new Identifier(name, this.filename),
        type: AttributeType.Static,
        readOnly: d.concatTokens().toUpperCase().includes(" READ-ONLY"),
        visibility,
      });
    }
    for (const d of contents.findDirectStatements(Statements.Constant)) {
      const name = d.findFirstExpression(Expressions.NamespaceSimpleName)!.getFirstToken();
      ret.push({
        name: name.getStr(),
        identifier: new Identifier(name, this.filename),
        type: AttributeType.Constant,
        readOnly: true,
        visibility,
      });
    }

    return ret;
  }

  private parseMethodDefinition(node: StructureNode | undefined, visibility: Visibility): InfoMethodDefinition[] {
    if (node === undefined) {
      return [];
    }

    const methods: InfoMethodDefinition[] = [];
    for (const def of node.findAllStatements(Statements.MethodDef)) {
      const methodName = def.findFirstExpression(Expressions.MethodName)?.getFirstToken();
      if (methodName === undefined) {
        continue;
      }
      methods.push({
        name: methodName.getStr(),
        identifier: new Identifier(methodName, this.filename),
        isRedefinition: def.findFirstExpression(Expressions.Redefinition) !== undefined,
        isAbstract: def.findFirstExpression(Expressions.Abstract) !== undefined,
        visibility,
      });
    }
    return methods;
  }

}