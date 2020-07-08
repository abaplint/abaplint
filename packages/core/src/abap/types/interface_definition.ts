import {Identifier} from "../4_file_information/_identifier";
import {StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {CurrentScope} from "../5_syntax/_current_scope";
import {IInterfaceDefinition, IImplementing} from "./_interface_definition";
import {IAttributes}  from "./_class_attributes";
import {ITypeDefinitions} from "./_type_definitions";
import {Attributes} from "./class_attributes";
import {TypeDefinitions} from "./type_definitions";
import {Visibility} from "../4_file_information/visibility";
import {ScopeType} from "../5_syntax/_scope_type";
import {IEventDefinition} from "./_event_definition";
import {EventDefinition} from "./event_definition";
import {IMethodDefinitions} from "./_method_definitions";
import {MethodDefinitions} from "./method_definitions";
import {IAliases} from "./_aliases";
import {Aliases} from "./aliases";

export class InterfaceDefinition extends Identifier implements IInterfaceDefinition {
  private readonly node: StructureNode;
  private attributes: IAttributes;
  private readonly implementing: IImplementing[];
  private typeDefinitions: ITypeDefinitions;
  private methodDefinitions: IMethodDefinitions;
  private readonly events: IEventDefinition[];

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    if (!(node.get() instanceof Structures.Interface)) {
      throw new Error("InterfaceDefinition, unexpected node type");
    }

    const name = node.findFirstStatement(Statements.Interface)!.findFirstExpression(Expressions.InterfaceName)!.getFirstToken();
    super(name, filename);

    this.node = node;
    this.events = [];
    this.implementing = [];

    scope.push(ScopeType.Interface, name.getStr(), name.getStart(), filename);
    this.parse(scope);
    scope.pop();
  }

  public getSuperClass(): undefined {
    return undefined;
  }

  public getImplementing(): readonly IImplementing[] {
    return this.implementing;
  }

  public getAliases(): IAliases {
    return new Aliases(this.node, this.filename);
  }

  public getEvents() {
    return this.events;
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

  public getMethodDefinitions(): IMethodDefinitions {
    return this.methodDefinitions;
  }

/////////////////

  private parse(scope: CurrentScope) {
    this.attributes = new Attributes(this.node, this.filename, scope);

    this.typeDefinitions = new TypeDefinitions(this.node, this.filename, scope);

    this.methodDefinitions = new MethodDefinitions(this.node, this.filename, scope);

    const events = this.node.findAllStatements(Statements.Events);
    for (const e of events) {
      this.events.push(new EventDefinition(e, Visibility.Public, this.filename, scope));
    }

    for (const i of this.node.findAllStatements(Statements.InterfaceDef)) {
      const name = i.findDirectExpression(Expressions.InterfaceName)?.getFirstToken().getStr();
      if (name) {
        this.implementing.push({name, partial: false});
      }
    }

  }

}