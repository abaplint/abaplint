import {Identifier} from "../4_file_information/_identifier";
import {StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
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
import {ReferenceType} from "../5_syntax/_reference";
import {SyntaxInput} from "../5_syntax/_syntax_input";
import {Alias} from "./alias";
import {ObjectOriented} from "../5_syntax/_object_oriented";


export class InterfaceDefinition extends Identifier implements IInterfaceDefinition {
  private attributes: IAttributes;
  private readonly implementing: IImplementing[];
  private typeDefinitions: ITypeDefinitions;
  private methodDefinitions: IMethodDefinitions;
  private readonly events: IEventDefinition[];
  private readonly globalValue: boolean;
  private aliases: readonly Alias[];

  public constructor(node: StructureNode, input: SyntaxInput) {
    if (!(node.get() instanceof Structures.Interface)) {
      throw new Error("InterfaceDefinition, unexpected node type");
    }

    const name = node.findFirstStatement(Statements.Interface)!.findFirstExpression(Expressions.InterfaceName)!.getFirstToken();
    super(name, input.filename);
    input.scope.addInterfaceDefinition(this);

    this.events = [];
    this.implementing = [];
    this.globalValue = node.findFirstExpression(Expressions.ClassGlobal) !== undefined;

    input.scope.push(ScopeType.Interface, name.getStr(), node.getFirstToken().getStart(), input.filename);
    this.parse(input, node);
    input.scope.pop(node.getLastToken().getEnd());

    // perform checks after everything has been initialized
    this.checkMethodNameLength();
  }

  public getSuperClass(): undefined {
    return undefined;
  }

  public getImplementing(): readonly IImplementing[] {
    return this.implementing;
  }

  public getAliases() {
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

  private checkMethodNameLength() {
    for (const m of this.methodDefinitions.getAll()) {
      if (m.getName().length > 30) {
        const message = `Method name "${m.getName()}" is too long, maximum length is 30 characters`;
        throw new Error(message);
      }
    }
  }

  private checkInterfacesExists(input: SyntaxInput, node: StructureNode) {
    for (const i of node.findAllStatements(Statements.InterfaceDef)) {
      const token = i.findDirectExpression(Expressions.InterfaceName)?.getFirstToken();
      const name = token?.getStr();
      if (name) {
        this.implementing.push({name, partial: false});

        const idef = input.scope.findInterfaceDefinition(name);
        if (idef) {
          input.scope.addReference(token, idef, ReferenceType.ObjectOrientedReference, this.filename, {ooName: name.toUpperCase(), ooType: "INTF"});
        } else if (input.scope.getDDIC().inErrorNamespace(name) === false) {
          input.scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, this.filename);
        } else {
          throw new Error("Interface " + name + " unknown");
        }
      }
    }
  }

  private parse(input: SyntaxInput, node: StructureNode) {
    this.checkInterfacesExists(input, node);

    const helper = new ObjectOriented(input.scope);
    helper.fromInterfaces(this);

    // todo, proper sequencing, the statements should be processed line by line
    this.attributes = new Attributes(node, input);
    this.typeDefinitions = this.attributes.getTypes();

    this.aliases = this.attributes.getAliases();

    const events = node.findAllStatements(Statements.Events);
    for (const e of events) {
      this.events.push(new EventDefinition(e, Visibility.Public, input));
    }

    this.methodDefinitions = new MethodDefinitions(node, input);
    if (this.methodDefinitions.getByName("CONSTRUCTOR") !== undefined) {
      throw new Error("Interfaces cannot have constructor methods");
    }

  }

}