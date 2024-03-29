import {StatementNode, StructureNode} from "../nodes";
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
import {AbstractToken} from "../1_lexer/tokens/abstract_token";

export class ClassDefinition extends Identifier implements IClassDefinition {
  private readonly methodDefs: MethodDefinitions;
  private readonly types: TypeDefinitions;
  private readonly attributes: Attributes;
  private readonly events: IEventDefinition[];
  private readonly friends: string[];
  private readonly superClass: string | undefined;
  private readonly implementing: IImplementing[];
  private readonly testing: boolean;
  private readonly abstract: boolean;
  private readonly finalValue: boolean;
  private readonly globalValue: boolean;
  private readonly sharedMemory: boolean;
  private aliases: IAliases;

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    if (!(node.get() instanceof Structures.ClassDefinition)) {
      throw new Error("ClassDefinition, unexpected node type");
    }

    const def = node.findFirstStatement(Statements.ClassDefinition);
    const name = def!.findDirectExpression(Expressions.ClassName)!.getFirstToken();
    super(name, filename);
    scope.addClassDefinition(this);

    this.events = [];
    this.implementing = [];
    this.globalValue = def!.findFirstExpression(Expressions.ClassGlobal) !== undefined;
    this.finalValue = def!.findFirstExpression(Expressions.ClassFinal) !== undefined;

    scope.push(ScopeType.ClassDefinition, name.getStr(), name.getStart(), filename);

    this.superClass = this.findSuper(def, filename, scope);
    this.friends = this.findFriends(def, filename, scope);

    this.parse(filename, scope, node);

    const helper = new ObjectOriented(scope);
    helper.fromSuperClassesAndInterfaces(this);
    helper.addAliasedTypes(this.aliases);

    this.attributes = new Attributes(node, this.filename, scope);
    this.types = this.attributes.getTypes();

    const events = node.findAllStatements(Statements.Events);
    for (const e of events) {
      this.events.push(new EventDefinition(e, Visibility.Public, this.filename, scope)); // todo, all these are not Public
    }

    this.methodDefs = new MethodDefinitions(node, this.filename, scope);

    scope.pop(node.getLastToken().getEnd());

    const concat = def!.concatTokens().toUpperCase();

    this.testing = concat.includes(" FOR TESTING");
    this.sharedMemory = concat.includes(" SHARED MEMORY ENABLED");
    this.abstract = def?.findDirectTokenByText("ABSTRACT") !== undefined;

    // perform checks after everything has been initialized
    this.checkMethodsFromSuperClasses(scope);
  }

  public getFriends() {
    return this.friends;
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
    return this.globalValue;
  }

  public isFinal(): boolean {
    return this.finalValue;
  }

  public getImplementing(): readonly IImplementing[] {
    return this.implementing;
  }

  public getAliases(): IAliases {
    return this.aliases;
  }

  public isForTesting(): boolean {
    return this.testing;
  }

  public isAbstract(): boolean {
    return this.abstract;
  }

  public isSharedMemory(): boolean {
    return this.sharedMemory;
  }

/*
  public getEvents() {
  }
*/

  ///////////////////

  private findSuper(def: StatementNode | undefined, filename: string, scope: CurrentScope): string | undefined {
    const token = def?.findDirectExpression(SuperClassName)?.getFirstToken();
    this.addReference(token, filename, scope);
    const name = token?.getStr();
    return name;
  }

  private checkMethodsFromSuperClasses(scope: CurrentScope) {
    let sup = this.getSuperClass();
    const names: Set<string> = new Set();

    while (sup !== undefined) {
      const cdef = scope.findClassDefinition(sup);
      for (const m of cdef?.getMethodDefinitions()?.getAll() || []) {
        const name = m.getName().toUpperCase();
        if (m.getVisibility() === Visibility.Private) {
          continue;
        } else if (name === "CONSTRUCTOR" || name === "CLASS_CONSTRUCTOR") {
          continue;
        }
        names.add(name);
      }
      for (const a of cdef?.getAliases().getAll() || []) {
        names.add(a.getName().toUpperCase());
      }
      sup = cdef?.getSuperClass();
    }

    for (const m of this.getMethodDefinitions().getAll()) {
      if (names.has(m.getName().toUpperCase()) && m.isRedefinition() === false) {
        throw new Error(`${m.getName().toUpperCase()} already declared in superclass`);
      }
    }
  }

  private findFriends(def: StatementNode | undefined, filename: string, scope: CurrentScope): string[] {
    const result: string[] = [];
    for (const n of def?.findDirectExpression(Expressions.ClassFriends)?.findDirectExpressions(Expressions.ClassName) || []) {
      const token = n.getFirstToken();
      this.addReference(token, filename, scope);
      const name = token.getStr();
      result.push(name);
    }
    return result;
  }

  private addReference(token: AbstractToken | undefined, filename: string, scope: CurrentScope) {
    const name = token?.getStr();
    if (name) {
      const s = scope.findClassDefinition(name);
      if (s) {
        scope.addReference(token, s, ReferenceType.ObjectOrientedReference, filename, {ooName: name.toUpperCase(), ooType: "CLAS"});
      } else if (scope.getDDIC().inErrorNamespace(name) === false) {
        scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, filename);
      }
    }
  }

  private parse(filename: string, scope: CurrentScope, inputNode: StructureNode) {
    for (const node of inputNode.findAllStatements(Statements.InterfaceDef)) {
      const partial = node.findDirectTokenByText("PARTIALLY") !== undefined;
      const token = node.findFirstExpression(Expressions.InterfaceName)?.getFirstToken();
      if (token === undefined) {
        throw new Error("ClassDefinition, unable to find interface token");
      }
      const name = token.getStr().toUpperCase();
      this.implementing.push({name, partial});

      const intf = scope.findInterfaceDefinition(name);
      if (intf) {
        scope.addReference(token, intf, ReferenceType.ObjectOrientedReference, filename, {ooName: name.toUpperCase(), ooType: "INTF"});
      } else if (scope.getDDIC().inErrorNamespace(name) === false) {
        scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, filename, {ooName: name.toUpperCase(), ooType: "INTF"});
      } else {
        scope.addReference(token, undefined, ReferenceType.ObjectOrientedUnknownReference, filename, {ooName: name.toUpperCase(), ooType: "INTF"});
      }
    }

    this.aliases = new Aliases(inputNode, this.filename, scope);
  }

}