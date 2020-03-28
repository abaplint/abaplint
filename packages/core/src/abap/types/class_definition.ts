import {StructureNode} from "../../abap/nodes";
import {MethodDefinitions} from "./method_definitions";
import {SuperClassName} from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import * as Structures from "../3_structures/structures";
import * as Expressions from "../2_statements/expressions";
import {Attributes} from "./class_attributes";
import {Identifier} from "./_identifier";
import {Aliases} from "./aliases";
import {CurrentScope} from "../syntax/_current_scope";
import {TypeDefinitions} from ".";

export class ClassDefinition extends Identifier {
  private readonly node: StructureNode;

  public constructor(node: StructureNode, filename: string) {
    if (!(node.get() instanceof Structures.ClassDefinition)) {
      throw new Error("ClassDefinition, unexpected node type");
    }

    const name = node.findFirstStatement(Statements.ClassDefinition)!.findFirstExpression(Expressions.ClassName)!.getFirstToken();
    super(name, filename);

    this.node = node;
  }

  public getMethodDefinitions(scope: CurrentScope): MethodDefinitions {
    return new MethodDefinitions(this.node, this.filename, scope);
  }

  public getTypeDefinitions(scope: CurrentScope): TypeDefinitions {
    return new TypeDefinitions(this.node, this.filename, scope);
  }

  public getSuperClass(): string | undefined {
    const found = this.node.findFirstStatement(Statements.ClassDefinition);
    const token = found ? found.findFirstExpression(SuperClassName) : undefined;
    return token ? token.getFirstToken().getStr() : undefined;
  }

  public getAttributes(scope: CurrentScope): Attributes {
    return new Attributes(this.node, this.filename, scope);
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