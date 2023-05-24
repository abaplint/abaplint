import * as Structures from "../3_structures/structures";
import * as Expressions from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import {IABAPFileInformation, InfoClassImplementation, InfoClassDefinition, InfoMethodDefinition, InfoInterfaceDefinition, InfoAttribute, InfoAlias, AttributeLevel, InfoMethodParameter, MethodParameterDirection, InfoFormDefinition, InfoImplementing, InfoConstant, Duration, RiskLevel} from "./_abap_file_information";
import {StructureNode, StatementNode} from "../nodes";
import {Identifier} from "./_identifier";
import * as Tokens from "../1_lexer/tokens";
import {Visibility} from "./visibility";

export class ABAPFileInformation implements IABAPFileInformation {
  private readonly interfaces: InfoInterfaceDefinition[];
  private readonly classes: InfoClassDefinition[];
  private readonly forms: InfoFormDefinition[];
  private readonly implementations: InfoClassImplementation[];
  private readonly filename: string;

  public constructor(structure: StructureNode | undefined, filename: string) {
    this.forms = [];
    this.implementations = [];
    this.interfaces = [];
    this.classes = [];
    this.filename = filename;
    this.parse(structure);
  }

  public listClassImplementations(): readonly InfoClassImplementation[] {
    return this.implementations;
  }

  public listInterfaceDefinitions(): readonly InfoInterfaceDefinition[] {
    return this.interfaces;
  }

  public getInterfaceDefinitionByName(name: string): InfoInterfaceDefinition | undefined {
    const upper = name.toUpperCase();
    for (const i of this.listInterfaceDefinitions()) {
      if (i.identifier.getName().toUpperCase() === upper) {
        return i;
      }
    }
    return undefined;
  }

  public listClassDefinitions(): readonly InfoClassDefinition[] {
    return this.classes;
  }

  public getClassDefinitionByName(name: string): InfoClassDefinition | undefined {
    const upper = name.toUpperCase();
    for (const d of this.listClassDefinitions()) {
      if (d.identifier.getName().toUpperCase() === upper) {
        return d;
      }
    }
    return undefined;
  }

  public getClassImplementationByName(name: string): InfoClassImplementation | undefined {
    const upper = name.toUpperCase();
    for (const impl of this.listClassImplementations()) {
      if (impl.identifier.getName().toUpperCase() === upper) {
        return impl;
      }
    }
    return undefined;
  }

  public listFormDefinitions(): InfoFormDefinition[] {
    return this.forms;
  }

  ///////////////////////

  private parse(structure: StructureNode | undefined): void {
    if (structure === undefined) {
      return;
    }

    this.parseClasses(structure);
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
        methods,
      });
    }

    for (const statement of structure.findAllStructures(Structures.Form)) {
      // FORMs can contain a dash in the name
      const pos = statement.findFirstExpression(Expressions.FormName)!.getFirstToken().getStart();
      const name = statement.findFirstExpression(Expressions.FormName)!.concatTokens();
      const nameToken = new Tokens.Identifier(pos, name);
      this.forms.push({
        name: nameToken.getStr(),
        identifier: new Identifier(nameToken, this.filename),
      });
    }
  }

  private parseInterfaces(structure: StructureNode) {
    for (const found of structure.findDirectStructures(Structures.Interface)) {
      const i = found.findFirstStatement(Statements.Interface);
      if (i === undefined) {
        throw new Error("Interface expected, parseInterfaces");
      }
      const interfaceName = i.findDirectExpression(Expressions.InterfaceName)!.getFirstToken();
      const methods = this.parseMethodDefinition(found, Visibility.Public);
      const attributes = this.parseAttributes(found, Visibility.Public);
      const aliases = this.parseAliases(found, Visibility.Public);
      const constants = this.parseConstants(found, Visibility.Public);
      const g = i.findDirectExpression(Expressions.ClassGlobal);

      this.interfaces.push({
        name: interfaceName.getStr(),
        identifier: new Identifier(interfaceName, this.filename),
        isLocal: g === undefined,
        isGlobal: g !== undefined,
        interfaces: this.getImplementing(found),
        aliases,
        methods,
        constants,
        attributes,
      });
    }
  }

  private parseClasses(structure: StructureNode) {
    for (const found of structure.findAllStructures(Structures.ClassDefinition)) {
      const className = found.findFirstStatement(Statements.ClassDefinition)!.findFirstExpression(Expressions.ClassName)!.getFirstToken();

      const methods = this.parseMethodDefinition(found.findFirstStructure(Structures.PublicSection), Visibility.Public);
      methods.push(...this.parseMethodDefinition(found.findFirstStructure(Structures.ProtectedSection), Visibility.Protected));
      methods.push(...this.parseMethodDefinition(found.findFirstStructure(Structures.PrivateSection), Visibility.Private));

      const attributes = this.parseAttributes(found.findFirstStructure(Structures.PublicSection), Visibility.Public);
      attributes.push(...this.parseAttributes(found.findFirstStructure(Structures.ProtectedSection), Visibility.Protected));
      attributes.push(...this.parseAttributes(found.findFirstStructure(Structures.PrivateSection), Visibility.Private));

      const aliases = this.parseAliases(found.findFirstStructure(Structures.PublicSection), Visibility.Public);
      aliases.push(...this.parseAliases(found.findFirstStructure(Structures.ProtectedSection), Visibility.Protected));
      aliases.push(...this.parseAliases(found.findFirstStructure(Structures.PrivateSection), Visibility.Private));

      const constants = this.parseConstants(found.findFirstStructure(Structures.PublicSection), Visibility.Public);
      constants.push(...this.parseConstants(found.findFirstStructure(Structures.ProtectedSection), Visibility.Protected));
      constants.push(...this.parseConstants(found.findFirstStructure(Structures.PrivateSection), Visibility.Private));

      const superClassName = found.findFirstExpression(Expressions.SuperClassName)?.getFirstToken().getStr();
      const containsGlobal = found.findFirstExpression(Expressions.ClassGlobal);
      const cdef = found.findFirstStatement(Statements.ClassDefinition);
      const concat = cdef?.concatTokens().toUpperCase() || "";

      let riskLevel: RiskLevel | undefined;
      if (concat.includes("RISK LEVEL CRITICAL")) {
        riskLevel = RiskLevel.critical;
      } else if (concat.includes("RISK LEVEL DANGEROUS")) {
        riskLevel = RiskLevel.dangerous;
      } else if (concat.includes("RISK LEVEL HARMLESS")) {
        riskLevel = RiskLevel.harmless;
      }

      let duration: Duration | undefined;
      if (concat.includes("DURATION SHORT")) {
        duration = Duration.short;
      } else if (concat.includes("DURATION LONG")) {
        duration = Duration.long;
      } else if (concat.includes("DURATION MEDIUM")) {
        duration = Duration.medium;
      }

      this.classes.push({
        name: className.getStr(),
        identifier: new Identifier(className, this.filename),
        isLocal: containsGlobal === undefined,
        isGlobal: containsGlobal !== undefined,
        methods,
        superClassName,
        interfaces: this.getImplementing(found),
        isForTesting: concat.includes(" FOR TESTING"),
        duration,
        riskLevel,
        isAbstract: cdef?.findDirectTokenByText("ABSTRACT") !== undefined,
        isSharedMemory: concat.includes(" SHARED MEMORY ENABLED"),
        isFinal: found.findFirstExpression(Expressions.ClassFinal) !== undefined,
        aliases,
        attributes,
        constants,
      });
    }
  }

  ///////////////////

  private getImplementing(input: StructureNode): InfoImplementing[] {
    const ret: InfoImplementing[] = [];
    for (const node of input.findAllStatements(Statements.InterfaceDef)) {
      const abstract = node.findDirectExpression(Expressions.AbstractMethods);
      const abstractMethods: string[] = [];
      if (abstract) {
        for (const m of abstract.findDirectExpressions(Expressions.MethodName)) {
          abstractMethods.push(m.concatTokens().toUpperCase());
        }
      }

      const final = node.findDirectExpression(Expressions.FinalMethods);
      const finalMethods: string[] = [];
      if (final) {
        for (const m of final.findDirectExpressions(Expressions.MethodName)) {
          finalMethods.push(m.concatTokens().toUpperCase());
        }
      }

      const concat = node.concatTokens().toUpperCase();
      const allAbstract = concat.includes(" ALL METHODS ABSTRACT");
      const partial = concat.includes(" PARTIALLY IMPLEMENTED");
      const name = node.findFirstExpression(Expressions.InterfaceName)!.getFirstToken().getStr().toUpperCase();
      ret.push({
        name,
        partial,
        allAbstract,
        abstractMethods,
        finalMethods,
      });
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

  private parseConstants(node: StructureNode | undefined, visibility: Visibility): InfoConstant[] {
    if (node === undefined) {
      return [];
    }

    const results: InfoConstant[] = [];
    for (const constant of node.findAllStatements(Statements.Constant)) {
      const name = constant.findFirstExpression(Expressions.DefinitionName)!.getFirstToken();
      const typeName = constant.findFirstExpression(Expressions.TypeName);

      // VALUE `const_value` -> `const_value`
      const literal = constant.findFirstExpression(Expressions.Value)?.getTokens()[1].getStr() ?? "``";
      // `const_value` -> const_value
      const value = literal.slice(1, literal?.length - 1);

      results.push({
        name: name!.getStr(),
        typeName: typeName ? typeName.getFirstToken().getStr() : "",
        value: value,
        identifier: new Identifier(name, this.filename),
        visibility,
      });
    }

    return results;
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
      const name = d.findFirstExpression(Expressions.DefinitionName)!.getFirstToken();
      ret.push({
        name: name.getStr(),
        identifier: new Identifier(name, this.filename),
        level: AttributeLevel.Instance,
        readOnly: d.concatTokens().toUpperCase().includes(" READ-ONLY"),
        visibility,
      });
    }
    for (const d of contents.findDirectStatements(Statements.ClassData)) {
      const name = d.findFirstExpression(Expressions.DefinitionName)!.getFirstToken();
      ret.push({
        name: name.getStr(),
        identifier: new Identifier(name, this.filename),
        level: AttributeLevel.Static,
        readOnly: d.concatTokens().toUpperCase().includes(" READ-ONLY"),
        visibility,
      });
    }
    for (const d of contents.findDirectStatements(Statements.Constant)) {
      const name = d.findFirstExpression(Expressions.DefinitionName)!.getFirstToken();
      ret.push({
        name: name.getStr(),
        identifier: new Identifier(name, this.filename),
        level: AttributeLevel.Constant,
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
      const methodName = def.findDirectExpression(Expressions.MethodName)?.getFirstToken();
      if (methodName === undefined) {
        continue;
      }

      const parameters = this.parseMethodParameters(def);

      methods.push({
        name: methodName.getStr(),
        identifier: new Identifier(methodName, this.filename),
        isRedefinition: def.findDirectExpression(Expressions.Redefinition) !== undefined,
        isForTesting: def.concatTokens().toUpperCase().includes(" FOR TESTING"),
        isAbstract: def.findDirectExpression(Expressions.Abstract) !== undefined,
        isEventHandler: def.findDirectExpression(Expressions.EventHandler) !== undefined,
        visibility,
        parameters,
        exceptions: [], // todo
      });
    }
    return methods;
  }

  // todo, refactor this method, it is too long
  private parseMethodParameters(node: StatementNode): InfoMethodParameter[] {
    const ret: InfoMethodParameter[] = [];

    const importing = node.findFirstExpression(Expressions.MethodDefImporting);
    if (importing) {
      for (const param of importing.findAllExpressions(Expressions.MethodParam)) {
        const name = param.findDirectExpression(Expressions.MethodParamName)?.getFirstToken();
        if (name) {
          ret.push({
            name: name.getStr().replace("!", ""),
            identifier: new Identifier(name, this.filename),
            direction: MethodParameterDirection.Importing,
          });
        }
      }
    }

    const exporting = node.findFirstExpression(Expressions.MethodDefExporting);
    if (exporting) {
      for (const param of exporting.findAllExpressions(Expressions.MethodParam)) {
        const name = param.findDirectExpression(Expressions.MethodParamName)?.getFirstToken();
        if (name) {
          ret.push({
            name: name.getStr().replace("!", ""),
            identifier: new Identifier(name, this.filename),
            direction: MethodParameterDirection.Exporting,
          });
        }
      }
    }

    const changing = node.findFirstExpression(Expressions.MethodDefChanging);
    if (changing) {
      for (const param of changing.findAllExpressions(Expressions.MethodParam)) {
        const name = param.findDirectExpression(Expressions.MethodParamName)?.getFirstToken();
        if (name) {
          ret.push({
            name: name.getStr().replace("!", ""),
            identifier: new Identifier(name, this.filename),
            direction: MethodParameterDirection.Changing,
          });
        }
      }
    }

    const returning = node.findFirstExpression(Expressions.MethodDefReturning);
    if (returning) {
      const name = returning.findDirectExpression(Expressions.MethodParamName)?.getFirstToken();
      if (name) {
        ret.push({
          name: name.getStr().replace("!", ""),
          identifier: new Identifier(name, this.filename),
          direction: MethodParameterDirection.Returning,
        });
      }
    }

    return ret;
  }

}