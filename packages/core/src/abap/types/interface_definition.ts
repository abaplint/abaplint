import {Identifier} from "../4_object_information/_identifier";
import {StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {CurrentScope} from "../5_syntax/_current_scope";
import {IInterfaceDefinition} from "./_interface_definition";
import {IAttributes}  from "./_class_attributes";
import {ITypeDefinitions} from "./_type_definitions";
import {MethodDefinition} from "./method_definition";
import {Attributes} from "./class_attributes";
import {TypeDefinitions} from "./type_definitions";
import {Visibility} from "../4_object_information/visibility";
import {ScopeType} from "../5_syntax/_scope_type";

export class InterfaceDefinition extends Identifier implements IInterfaceDefinition {
  private readonly node: StructureNode;
  private attributes: IAttributes | undefined;
  private typeDefinitions: ITypeDefinitions;
  private methodDefinitions: MethodDefinition[];

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    if (!(node.get() instanceof Structures.Interface)) {
      throw new Error("InterfaceDefinition, unexpected node type");
    }

    const name = node.findFirstStatement(Statements.Interface)!.findFirstExpression(Expressions.InterfaceName)!.getFirstToken();
    super(name, filename);

    this.node = node;

    scope.push(ScopeType.Interface, name.getStr(), name.getStart(), filename);
    this.parse(scope);
    scope.pop();
  }

  public getAttributes() {
    return this.attributes;
  }

  public getTypeDefinitions() {
    return this.typeDefinitions;
  }

  public isLocal(): boolean {
    return !this.isGlobal();
  }

  public isGlobal(): boolean {
    return this.node.findFirstExpression(Expressions.Global) !== undefined;
  }

  public getMethodDefinitions(): MethodDefinition[] {
    return this.methodDefinitions;
  }

/////////////////

  private parse(scope: CurrentScope) {

    if (this.node) {
      this.attributes = new Attributes(this.node, this.filename, scope);
    } else {
      this.attributes = undefined;
    }

    this.typeDefinitions = new TypeDefinitions(this.node, this.filename, scope);

    this.methodDefinitions = [];
    const defs = this.node.findAllStatements(Statements.MethodDef);
    for (const def of defs) {
      this.methodDefinitions.push(new MethodDefinition(def, Visibility.Public, this.filename, scope));
    }
  }

}