import {StructureNode} from "../../abap/nodes";
import {MethodDefinitions} from "./method_definitions";
import {SuperClassName} from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import * as Structures from "../3_structures/structures";
import * as Expressions from "../2_statements/expressions";
import {Attributes} from "./class_attributes";
import {Identifier} from "../4_file_information/_identifier";
import {Aliases} from "./aliases";
import {CurrentScope} from "../5_syntax/_current_scope";
import {IClassDefinition} from "./_class_definition";
import {TypeDefinitions} from "./type_definitions";
import {ScopeType} from "../5_syntax/_scope_type";

export class ClassDefinition extends Identifier implements IClassDefinition {
  private readonly node: StructureNode;
  private readonly methodDefs: MethodDefinitions;
  private readonly types: TypeDefinitions;
  private readonly attributes: Attributes;

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    if (!(node.get() instanceof Structures.ClassDefinition)) {
      throw new Error("ClassDefinition, unexpected node type");
    }

    const name = node.findFirstStatement(Statements.ClassDefinition)!.findFirstExpression(Expressions.ClassName)!.getFirstToken();
    super(name, filename);

    this.node = node;

    scope.push(ScopeType.ClassDefinition, name.getStr(), name.getStart(), filename);

    this.fillScopeWithSuper(scope);

    // todo, handle the sequence of types and attributes
    this.types = new TypeDefinitions(this.node, this.filename, scope);
    this.attributes = new Attributes(this.node, this.filename, scope);
    this.methodDefs = new MethodDefinitions(this.node, this.filename, scope);
    scope.pop();
  }

  private fillScopeWithSuper(scope: CurrentScope) {
    let sup = scope.findClassDefinition(this.getSuperClass());
    while (sup !== undefined) {
      scope.addList(sup.getAttributes().getAll());
      scope.addList(sup.getAttributes().getConstants());
      for (const t of sup.getTypeDefinitions().getAll()) {
        scope.addType(t);
      }
      sup = scope.findClassDefinition(sup.getSuperClass());
    }
  }

  public getMethodDefinitions(): MethodDefinitions {
    return this.methodDefs;
  }

  public getTypeDefinitions(): TypeDefinitions {
    return this.types;
  }

  public getSuperClass(): string | undefined {
    const found = this.node.findFirstStatement(Statements.ClassDefinition);
    const token = found ? found.findFirstExpression(SuperClassName) : undefined;
    return token ? token.getFirstToken().getStr() : undefined;
  }

  public getAttributes(): Attributes {
    return this.attributes;
  }

  public isException(): boolean {
    const superClass = this.getSuperClass();
    // todo, this logic is not correct
    if (superClass && (superClass.match(/^.?cx_.*$/i) || superClass.match(/^\/.+\/cx_.*$/i))) {
      return true;
    } else {
      return false;
    }
  }

  public isLocal(): boolean {
    return !this.isGlobal();
  }

  public isGlobal(): boolean {
    return this.node.findFirstExpression(Expressions.Global) !== undefined;
  }

  public isFinal(): boolean {
    return this.node.findFirstExpression(Expressions.ClassFinal) !== undefined;
  }

  public getImplementing(): {name: string, partial: boolean}[] {
    const ret: {name: string, partial: boolean}[] = [];
    for (const node of this.node.findAllStatements(Statements.InterfaceDef)) {
      const partial = node.concatTokens().toUpperCase().includes("PARTIALLY IMPLEMENTED");
      const name = node.findFirstExpression(Expressions.InterfaceName)!.getFirstToken().getStr().toUpperCase();
      ret.push({name, partial});
    }
    return ret;
  }

  public getAliases(): Aliases {
    return new Aliases(this.node, this.filename);
  }

  public isForTesting(): boolean {
    return this.node.findFirstStatement(Statements.ClassDefinition)!.concatTokens().toUpperCase().includes(" FOR TESTING");
  }

  public isAbstract(): boolean {
    return this.node.findFirstStatement(Statements.ClassDefinition)!.concatTokens().toUpperCase().includes(" ABSTRACT");
  }

/*
  public getFriends() {
  }

  public getEvents() {
  }
*/

}