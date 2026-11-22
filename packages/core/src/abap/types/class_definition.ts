import {StatementNode, StructureNode} from "../nodes";
import {MethodDefinitions} from "./method_definitions";
import {SuperClassName} from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import * as Structures from "../3_structures/structures";
import * as Expressions from "../2_statements/expressions";
import {Attributes} from "./class_attributes";
import {Identifier} from "../4_file_information/_identifier";
import {IClassDefinition} from "./_class_definition";
import {TypeDefinitions} from "./type_definitions";
import {ScopeType} from "../5_syntax/_scope_type";
import {EventDefinition} from "./event_definition";
import {Visibility} from "../4_file_information/visibility";
import {IEventDefinition} from "./_event_definition";
import {IMethodDefinitions} from "./_method_definitions";
import {ObjectOriented} from "../5_syntax/_object_oriented";
import {IImplementing} from "./_interface_definition";
import {IReference, ReferenceType} from "../5_syntax/_reference";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {SyntaxInput, syntaxIssue} from "../5_syntax/_syntax_input";
import {Alias} from "./alias";
import {SpaghettiScopeNode} from "../5_syntax/spaghetti_scope";
import {checkAliasNameConflicts} from "./_alias_conflicts";
import {Class} from "../../objects/class";

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
  private readonly aliases: Alias[];
  private readonly createVisibilityValue: Visibility;

  public constructor(node: StructureNode, input: SyntaxInput) {
    if (!(node.get() instanceof Structures.ClassDefinition)) {
      throw new Error("ClassDefinition, unexpected node type");
    }

    const def = node.findFirstStatement(Statements.ClassDefinition);
    const name = def!.findDirectExpression(Expressions.ClassName)!.getFirstToken();
    super(name, input.filename);
    input.scope.addClassDefinition(this);

    this.events = [];
    this.implementing = [];
    this.globalValue = def!.findFirstExpression(Expressions.ClassGlobal) !== undefined;
    this.finalValue = def!.findFirstExpression(Expressions.ClassFinal) !== undefined;

    input.scope.push(ScopeType.ClassDefinition, name.getStr(), name.getStart(), input.filename);

    this.superClass = this.findSuper(def, input);
    this.friends = this.findFriends(def, input);

    this.parse(input, node);

    const helper = new ObjectOriented(input.scope);
    helper.fromSuperClassesAndInterfaces(this);

    this.attributes = new Attributes(node, input);
    this.types = this.attributes.getTypes();
    this.aliases = this.attributes.getAliases();

    const events = node.findAllStatements(Statements.Events);
    for (const e of events) {
      const eventName = e.findDirectExpression(Expressions.EventName)?.concatTokens().toUpperCase();
      if (this.events.find(ev => ev.getName().toUpperCase() === eventName) !== undefined) {
        input.issues.push(syntaxIssue(input, e.getFirstToken(), "Event " + eventName + " already defined"));
        continue;
      }
      this.events.push(new EventDefinition(e, Visibility.Public, input)); // todo, all these are not Public
    }

    this.methodDefs = new MethodDefinitions(node, input);

    const scope = input.scope.pop(node.getLastToken().getEnd());

    const concat = def!.concatTokens().toUpperCase();

    this.testing = concat.includes(" FOR TESTING");
    this.sharedMemory = concat.includes(" SHARED MEMORY ENABLED");
    this.abstract = def?.findDirectTokenByText("ABSTRACT") !== undefined;
    if (concat.includes(" CREATE PRIVATE")) {
      this.createVisibilityValue = Visibility.Private;
    } else if (concat.includes(" CREATE PROTECTED")) {
      this.createVisibilityValue = Visibility.Protected;
    } else {
      this.createVisibilityValue = Visibility.Public;
    }

    // perform checks after everything has been initialized
    this.checkInterfaceVisibility(input, node);
    this.checkMethodsFromSuperClasses(input);
    this.checkMethodNameConflicts(input);
    checkAliasNameConflicts(input, this.aliases, this.methodDefs, this.attributes, this.types);
    this.checkEventNameConflicts(input);
    this.checkClassNameLength(input);
    this.checkMethodNameLength(input);
    this.checkClassConstructor(input);
    this.checkLocalTypesInPublicSections(input, node, scope.getTop());
    this.checkTestMethodsInTestClass(input, node);
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

  public getAliases() {
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

  public getCreateVisibility(): Visibility {
    return this.createVisibilityValue;
  }

/*
  public getEvents() {
  }
*/

  ///////////////////

  private checkClassNameLength(input: SyntaxInput) {
    if (this.getName().length > 30) {
      const message = `Class name "${this.getName()}" is too long, maximum length is 30 characters`;
      input.issues.push(syntaxIssue(input, this.getToken(), message));
    }
  }

  private checkTestMethodsInTestClass(input: SyntaxInput, node: StructureNode) {
    if (this.isTestClass(input)) {
      return;
    }
    for (const m of node.findAllStatements(Statements.MethodDef)) {
      if (m.concatTokens().toUpperCase().includes(" FOR TESTING") === false) {
        continue;
      }
      const name = m.findDirectExpression(Expressions.MethodName)?.getFirstToken();
      const message = `Test method "${name?.getStr()}" can only be defined in a test class, FOR TESTING`;
      input.issues.push(syntaxIssue(input, name ?? m.getFirstToken(), message));
    }
  }

  /** the class or one of its super classes is defined FOR TESTING */
  private isTestClass(input: SyntaxInput): boolean {
    if (this.testing === true) {
      return true;
    }
    const visited = new Set<string>();
    let sup = this.superClass;
    while (sup !== undefined && visited.has(sup.toUpperCase()) === false) {
      visited.add(sup.toUpperCase());
      const def = input.scope.findClassDefinition(sup);
      if (def === undefined) {
        // void or unknown super class, cannot tell
        return true;
      } else if (def.isForTesting()) {
        return true;
      }
      sup = def.getSuperClass();
    }
    return false;
  }

  // the local types, classes and interfaces of a class pool can only be used in the PRIVATE SECTION of the global class
  private checkLocalTypesInPublicSections(input: SyntaxInput, node: StructureNode, scope: SpaghettiScopeNode) {
    if (this.globalValue === false || input.filename.toLowerCase().endsWith(".clas.abap") === false) {
      return;
    }
    const prefix = input.filename.toLowerCase().replace(/abap$/, "");
    const isLocal = (filename: string) => {
      const lower = filename.toLowerCase();
      return lower.startsWith(prefix)
        && (lower.endsWith(".clas.locals_def.abap") || lower.endsWith(".clas.locals_imp.abap"));
    };

    const references: IReference[] = [];
    const collect = (n: SpaghettiScopeNode) => {
      for (const r of n.getData().references) {
        if ((r.referenceType === ReferenceType.TypeReference || r.referenceType === ReferenceType.ObjectOrientedReference)
            && r.position.getFilename() === input.filename
            && r.position.getName().includes("~") === false // lif~meth of an ALIASES, the INTERFACES statement is reported
            && r.resolved !== undefined
            && isLocal(r.resolved.getFilename())) {
          references.push(r);
        }
      }
      n.getChildren().forEach(collect);
    };
    collect(scope);
    if (references.length === 0) {
      return;
    }

    const sections = [
      {section: node.findDirectStructure(Structures.PublicSection), name: "PUBLIC"},
    ];
    // a FINAL class has no subclasses, so the PROTECTED SECTION is effectively private
    if (this.finalValue === false) {
      sections.push({section: node.findDirectStructure(Structures.ProtectedSection), name: "PROTECTED"});
    }
    for (const {section, name} of sections) {
      for (const statement of section?.findAllStatementNodes() || []) {
        // compare with the tokens, the statements of a chain share the first tokens
        const tokens = statement.getTokens();
        const found = references
          .filter(r => tokens.some(t => t.getStart().equals(r.position.getStart())))
          .sort((a, b) => a.position.getStart().isBefore(b.position.getStart()) ? -1 : 1)[0];
        if (found !== undefined) {
          const message = "\"" + found.position.getName().toUpperCase() +
            "\" is local to the class pool and cannot be used in the " + name + " SECTION of the global class";
          input.issues.push(syntaxIssue(input, found.position.getToken(), message));
        }
      }
    }
  }

  private findSuper(def: StatementNode | undefined, input: SyntaxInput): string | undefined {
    const token = def?.findDirectExpression(SuperClassName)?.getFirstToken();
    this.addReference(token, input);
    const name = token?.getStr();
    if (token === undefined || name === undefined) {
      return undefined;
    }

    const cycle = this.findInheritanceCycle(name, input);
    if (cycle !== undefined) {
      input.issues.push(syntaxIssue(input, token, "Cyclic inheritance: " + cycle.join(" -> ")));
      // the class is kept without super class, so nothing walking the super classes loops
      return undefined;
    }

    return name;
  }

  /** returns the class names of the cycle when the super class chain leads back to this class */
  private findInheritanceCycle(superName: string, input: SyntaxInput): string[] | undefined {
    const own = this.getName().toUpperCase();
    const chain: string[] = [own];
    let current: string | undefined = superName.toUpperCase();
    while (current !== undefined) {
      chain.push(current);
      if (current === own) {
        return chain;
      } else if (chain.indexOf(current) < chain.length - 1) {
        // a cycle not involving this class, reported for the classes in it
        return undefined;
      }
      current = this.findSuperName(current, input)?.toUpperCase();
    }
    return undefined;
  }

  private findSuperName(name: string, input: SyntaxInput): string | undefined {
    const found = input.scope.findClassDefinition(name);
    if (found !== undefined && found.isGlobal() === false) {
      return found.getSuperClass();
    }
    // global classes are followed via the file information, their definition is not
    // available yet or has its super class removed when they are part of a cycle
    const clas = input.scope.getRegistry().getObject("CLAS", name) as Class | undefined;
    return clas?.getClassDefinition()?.superClassName ?? found?.getSuperClass();
  }

  private checkMethodNameLength(input: SyntaxInput) {
    for (const m of this.methodDefs.getAll()) {
      if (m.getName().length > 30 && m.getName().includes("~") === false) {
        const message = `Method name "${m.getName()}" is too long, maximum length is 30 characters`;
        input.issues.push(syntaxIssue(input, m.getToken(), message));
      }
    }
  }

  private checkClassConstructor(input: SyntaxInput) {
    for (const m of this.methodDefs.getAll()) {
      if (m.getName().toUpperCase() !== "CLASS_CONSTRUCTOR") {
        continue;
      }
      if (m.isStatic() === false) {
        input.issues.push(syntaxIssue(input, m.getToken(), "CLASS_CONSTRUCTOR must be static"));
      } else if (m.getVisibility() !== Visibility.Public) {
        input.issues.push(syntaxIssue(input, m.getToken(), "CLASS_CONSTRUCTOR must be declared in the public section"));
      }
    }
  }

  private checkInterfaceVisibility(input: SyntaxInput, node: StructureNode) {
    const sections = [
      node.findDirectStructure(Structures.ProtectedSection),
      node.findDirectStructure(Structures.PrivateSection),
    ];
    for (const section of sections) {
      for (const statement of section?.findAllStatements(Statements.InterfaceDef) || []) {
        input.issues.push(syntaxIssue(input, statement.getFirstToken(), "INTERFACES can only be declared in public sections"));
      }
    }
  }

  private checkMethodsFromSuperClasses(input: SyntaxInput) {
    const scope = input.scope;
    let sup = this.getSuperClass();
    const names: Set<string> = new Set();
    const methods: Map<string, Visibility> = new Map();

    while (sup !== undefined) {
      const cdef = scope.findClassDefinition(sup);
      for (const m of cdef?.getMethodDefinitions()?.getAll() || []) {
        const name = m.getName().toUpperCase();
        if (m.getVisibility() === Visibility.Private) {
          continue;
        } else if (name === "CONSTRUCTOR"
            || name === "DESTRUCTOR"
            || name === "CLASS_CONSTRUCTOR") {
          continue;
        }
        names.add(name);
        if (methods.has(name) === false) {
          methods.set(name, m.getVisibility());
        }
      }
      for (const a of cdef?.getAliases() || []) {
        names.add(a.getName().toUpperCase());
      }
      sup = cdef?.getSuperClass();
    }

    for (const m of this.getMethodDefinitions().getAll()) {
      if (names.has(m.getName().toUpperCase())
          && m.isRedefinition() === false) {
        input.issues.push(syntaxIssue(input, m.getToken(), `${m.getName().toUpperCase()} already declared in superclass`));
      }
      const superVisibility = methods.get(m.getName().toUpperCase());
      if (m.isRedefinition() === true
          && superVisibility !== undefined
          && m.getVisibility() !== superVisibility) {
        input.issues.push(syntaxIssue(input, m.getToken(), `${m.getName().toUpperCase()} redefinition visibility cannot be changed`));
      }
    }
  }

  private checkMethodNameConflicts(input: SyntaxInput) {
    for (const m of this.methodDefs.getAll()) {
      if (this.attributes.findByName(m.getName()) !== undefined
          || this.types.getByName(m.getName()) !== undefined) {
        input.issues.push(syntaxIssue(input, m.getToken(), `"${m.getName()}" already defined`));
      }
    }
  }

  private checkEventNameConflicts(input: SyntaxInput) {
    for (const e of this.events) {
      if (this.attributes.findByName(e.getName()) !== undefined
          || this.types.getByName(e.getName()) !== undefined
          || this.methodDefs.getByName(e.getName()) !== undefined) {
        input.issues.push(syntaxIssue(input, (e as EventDefinition).getToken(), `"${e.getName()}" already defined`));
      }
    }
  }

  private findFriends(def: StatementNode | undefined, input: SyntaxInput): string[] {
    const result: string[] = [];
    for (const n of def?.findDirectExpression(Expressions.ClassFriends)?.findDirectExpressions(Expressions.ClassName) || []) {
      const token = n.getFirstToken();
      const name = token.getStr();
      const s = input.scope.findClassDefinition(name);
      if (s) {
        input.scope.addReference(token, s, ReferenceType.ObjectOrientedReference, input.filename, {ooName: name.toUpperCase(), ooType: "CLAS"});
      } else if (input.scope.existsObject(name) !== undefined) {
        // DEFINITION DEFERRED friend
      } else if (input.scope.getDDIC().inErrorNamespace(name) === false) {
        input.scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, input.filename);
      } else {
        input.issues.push(syntaxIssue(input, token, "Friend class " + name.toUpperCase() + " does not exist"));
      }
      result.push(name);
    }
    return result;
  }

  private addReference(token: AbstractToken | undefined, input: SyntaxInput) {
    const name = token?.getStr();
    if (name) {
      const s = input.scope.findClassDefinition(name);
      if (s) {
        input.scope.addReference(token, s, ReferenceType.ObjectOrientedReference, input.filename, {ooName: name.toUpperCase(), ooType: "CLAS"});
      } else if (input.scope.getDDIC().inErrorNamespace(name) === false) {
        input.scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, input.filename);
      }
    }
  }

  private parse(input: SyntaxInput, inputNode: StructureNode) {
    for (const node of inputNode.findAllStatements(Statements.InterfaceDef)) {
      const partial = node.findDirectTokenByText("PARTIALLY") !== undefined;
      const token = node.findFirstExpression(Expressions.InterfaceName)?.getFirstToken();
      if (token === undefined) {
        throw new Error("ClassDefinition, unable to find interface token");
      }
      const name = token.getStr().toUpperCase();
      this.implementing.push({name, partial});

      const intf = input.scope.findInterfaceDefinition(name);
      if (intf) {
        input.scope.addReference(token, intf, ReferenceType.ObjectOrientedReference, input.filename, {ooName: name.toUpperCase(), ooType: "INTF"});
      } else if (input.scope.getDDIC().inErrorNamespace(name) === false) {
        input.scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, input.filename, {ooName: name.toUpperCase(), ooType: "INTF"});
      } else {
        input.scope.addReference(token, undefined, ReferenceType.ObjectOrientedUnknownReference, input.filename, {ooName: name.toUpperCase(), ooType: "INTF"});
      }
    }
  }

}
