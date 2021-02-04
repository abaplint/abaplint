import {Identifier} from "../4_file_information/_identifier";
import {StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {CurrentScope} from "../5_syntax/_current_scope";
import {IInterfaceDefinition, IImplementing} from "./_interface_definition";
import {IAttributes} from "./_class_attributes";
import {ITypeDefinitions} from "./_type_definitions";
import {Attributes} from "./class_attributes";
import {Visibility} from "../4_file_information/visibility";
import {ScopeType} from "../5_syntax/_scope_type";
import {IEventDefinition} from "./_event_definition";
import {EventDefinition} from "./event_definition";
import {IMethodDefinitions} from "./_method_definitions";
import {MethodDefinitions} from "./method_definitions";
import {IAliases} from "./_aliases";
import {Aliases} from "./aliases";
import {ReferenceType} from "../5_syntax/_reference";

export class InterfaceDefinition extends Identifier implements IInterfaceDefinition {
  private readonly node: StructureNode;
  private attributes: IAttributes;
  private readonly implementing: IImplementing[];
  private typeDefinitions: ITypeDefinitions;
  private methodDefinitions: IMethodDefinitions;
  private readonly events: IEventDefinition[];
  private aliases: IAliases;

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    if (!(node.get() instanceof Structures.Interface)) {
      throw new Error("InterfaceDefinition, unexpected node type");
    }

    const name = node.findFirstStatement(Statements.Interface)!.findFirstExpression(Expressions.InterfaceName)!.getFirstToken();
    super(name, filename);
    scope.addInterfaceDefinition(this);

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
    return this.aliases;
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
    return this.node.findFirstExpression(Expressions.ClassGlobal) !== undefined;
  }

  public getMethodDefinitions(): IMethodDefinitions {
    return this.methodDefinitions;
  }

/////////////////

  private parse(scope: CurrentScope) {
    this.attributes = new Attributes(this.node, this.filename, scope);
    this.typeDefinitions = this.attributes.getTypes();

    this.methodDefinitions = new MethodDefinitions(this.node, this.filename, scope);

    const events = this.node.findAllStatements(Statements.Events);
    for (const e of events) {
      this.events.push(new EventDefinition(e, Visibility.Public, this.filename, scope));
    }

    for (const i of this.node.findAllStatements(Statements.InterfaceDef)) {
      const token = i.findDirectExpression(Expressions.InterfaceName)?.getFirstToken();
      const name = token?.getStr();
      if (name) {
        this.implementing.push({name, partial: false});

        const idef = scope.findInterfaceDefinition(name);
        if (idef) {
          scope.addReference(token, idef, ReferenceType.ObjectOrientedReference, this.filename);
        } else if (scope.getDDIC().inErrorNamespace(name) === false) {
          scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, this.filename);
        } else {
          throw new Error("Interface " + name + " unknown");
        }
      }
    }

    this.aliases = new Aliases(this.node, this.filename, scope);
  }

}