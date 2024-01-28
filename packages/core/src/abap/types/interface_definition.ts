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
import {ClassConstant} from "./class_constant";
import {TypedIdentifier} from "./_typed_identifier";
import {Identifier as TokenIdentifier} from "../1_lexer/tokens";


export class InterfaceDefinition extends Identifier implements IInterfaceDefinition {
  private attributes: IAttributes;
  private readonly implementing: IImplementing[];
  private typeDefinitions: ITypeDefinitions;
  private methodDefinitions: IMethodDefinitions;
  private readonly events: IEventDefinition[];
  private readonly globalValue: boolean;
  private aliases: IAliases;

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    if (!(node.get() instanceof Structures.Interface)) {
      throw new Error("InterfaceDefinition, unexpected node type");
    }

    const name = node.findFirstStatement(Statements.Interface)!.findFirstExpression(Expressions.InterfaceName)!.getFirstToken();
    super(name, filename);
    scope.addInterfaceDefinition(this);

    this.events = [];
    this.implementing = [];
    this.globalValue = node.findFirstExpression(Expressions.ClassGlobal) !== undefined;

    scope.push(ScopeType.Interface, name.getStr(), node.getFirstToken().getStart(), filename);
    this.parse(scope, filename, node);
    scope.pop(node.getLastToken().getEnd());
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
    return !this.globalValue;
  }

  public isGlobal(): boolean {
    return this.globalValue;
  }

  public getMethodDefinitions(): IMethodDefinitions {
    return this.methodDefinitions;
  }

/////////////////

  private parse(scope: CurrentScope, filename: string, node: StructureNode) {
    // todo, proper sequencing, the statements should be processed line by line
    this.attributes = new Attributes(node, this.filename, scope);
    this.typeDefinitions = this.attributes.getTypes();

    this.aliases = new Aliases(node, this.filename, scope);
    // todo, cleanup aliases, vs "object_oriented.ts" vs "class_implementation.ts"
    for (const a of this.aliases.getAll()) {
      const [objName, fieldName] = a.getComponent().split("~");
      const idef = scope.findInterfaceDefinition(objName);
      if (idef) {
        const foundType = idef.getTypeDefinitions().getByName(fieldName);
        if (foundType) {
          scope.addTypeNamed(a.getName(), foundType);
        } else {
          const foundField = idef.getAttributes().findByName(fieldName);
          if (foundField && foundField instanceof ClassConstant) {
            const token = new TokenIdentifier(a.getStart(), a.getName());
            const id = new TypedIdentifier(token, filename, foundField.getType());
            const constant = new ClassConstant(id, Visibility.Public, foundField.getValue());
            scope.addIdentifier(constant);
          }
        }
      }
    }

    this.methodDefinitions = new MethodDefinitions(node, this.filename, scope);
    if (this.methodDefinitions.getByName("CONSTRUCTOR") !== undefined) {
      throw new Error("Interfaces cannot have constructor methods");
    }

    const events = node.findAllStatements(Statements.Events);
    for (const e of events) {
      this.events.push(new EventDefinition(e, Visibility.Public, this.filename, scope));
    }

    for (const i of node.findAllStatements(Statements.InterfaceDef)) {
      const token = i.findDirectExpression(Expressions.InterfaceName)?.getFirstToken();
      const name = token?.getStr();
      if (name) {
        this.implementing.push({name, partial: false});

        const idef = scope.findInterfaceDefinition(name);
        if (idef) {
          scope.addReference(token, idef, ReferenceType.ObjectOrientedReference, this.filename, {ooName: name.toUpperCase(), ooType: "INTF"});
        } else if (scope.getDDIC().inErrorNamespace(name) === false) {
          scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, this.filename);
        } else {
          throw new Error("Interface " + name + " unknown");
        }
      }
    }

  }

}