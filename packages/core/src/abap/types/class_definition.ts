import {StructureNode} from "../nodes";
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
import {EventDefinition} from "./event_definition";
import {Visibility} from "../4_file_information/visibility";
import {IEventDefinition} from "./_event_definition";
import {IMethodDefinitions} from "./_method_definitions";
import {IAliases} from "./_aliases";
import {ObjectOriented} from "../5_syntax/_object_oriented";
import {IImplementing} from "./_interface_definition";
import {ReferenceType} from "../5_syntax/_reference";

export class ClassDefinition extends Identifier implements IClassDefinition {
  private readonly node: StructureNode;
  private readonly methodDefs: MethodDefinitions;
  private readonly types: TypeDefinitions;
  private readonly attributes: Attributes;
  private readonly events: IEventDefinition[];
  private readonly superClass: string | undefined;
  private readonly implementing: IImplementing[];

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    if (!(node.get() instanceof Structures.ClassDefinition)) {
      throw new Error("ClassDefinition, unexpected node type");
    }

    const def = node.findFirstStatement(Statements.ClassDefinition);
    const name = def!.findDirectExpression(Expressions.ClassName)!.getFirstToken();
    super(name, filename);
    scope.addClassDefinition(this);

    this.node = node;
    this.events = [];
    this.implementing = [];

    scope.push(ScopeType.ClassDefinition, name.getStr(), name.getStart(), filename);

    const token = def?.findDirectExpression(SuperClassName);
    this.superClass = token?.getFirstToken().getStr();

    this.parse(filename, scope);

    const helper = new ObjectOriented(scope);
    helper.fromSuperClass(this);
    helper.fromInterfaces(this);

    // todo, handle the sequence of types and attributes
    this.types = new TypeDefinitions(this.node, this.filename, scope);
    this.attributes = new Attributes(this.node, this.filename, scope);
    this.methodDefs = new MethodDefinitions(this.node, this.filename, scope);
    const events = this.node.findAllStatements(Statements.Events);
    for (const e of events) {
      this.events.push(new EventDefinition(e, Visibility.Public, this.filename, scope)); // todo, all these are not Public
    }

    scope.pop();
  }

  public getEvents() {
    return this.events;
  }

  public getMethodDefinitions(): IMethodDefinitions {
    return this.methodDefs;
  }

  public getTypeDefinitions(): TypeDefinitions {
    return this.types;
  }

  public getSuperClass(): string | undefined {
    return this.superClass;
  }

  public getAttributes(): Attributes {
    return this.attributes;
  }

  public isGlobal(): boolean {
    return this.node.findFirstExpression(Expressions.ClassGlobal) !== undefined;
  }

  public isFinal(): boolean {
    return this.node.findFirstExpression(Expressions.ClassFinal) !== undefined;
  }

  public getImplementing(): readonly IImplementing[] {
    return this.implementing;
  }

  public getAliases(): IAliases {
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

  ///////////////////

  private parse(filename: string, scope: CurrentScope) {
    for (const node of this.node.findAllStatements(Statements.InterfaceDef)) {
      const partial = node.concatTokens().toUpperCase().includes("PARTIALLY IMPLEMENTED");
      const token = node.findFirstExpression(Expressions.InterfaceName)?.getFirstToken();
      if (token === undefined) {
        throw new Error("ClassDefinition, unable to find interface token");
      }
      const name = token.getStr().toUpperCase();
      this.implementing.push({name, partial});

      const intf = scope.findInterfaceDefinition(name);
      if (intf) {
        scope.addReference(token, intf, ReferenceType.ObjectOrientedReference, filename);
      }
    }
  }

}