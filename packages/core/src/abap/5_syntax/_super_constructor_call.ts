import * as Expressions from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import {MacroCall, NativeSQL, Unknown} from "../2_statements/statements/_statement";
import {Dash} from "../1_lexer/tokens/dash";
import {Identifier as IdentifierToken} from "../1_lexer/tokens/identifier";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {StatementNode, StructureNode} from "../nodes";
import {VirtualPosition} from "../../virtual_position";
import {Identifier} from "../4_file_information/_identifier";
import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {ISpaghettiScopeNode} from "./_spaghetti_scope";
import {SyntaxInput, syntaxIssue} from "./_syntax_input";

/** The constructor of a subclass must call SUPER->CONSTRUCTOR, and before the call instance
 *  attributes, instance methods and ME cannot be used. Runs when the method has been traversed,
 *  scopeNode is the outermost scope of the method, holding the references of its body. */
export class SuperConstructorCall {

  public static check(method: StructureNode, scopeNode: ISpaghettiScopeNode | undefined, input: SyntaxInput): void {
    const methodStatement = method.findDirectStatement(Statements.MethodImplementation);
    const methodName = methodStatement?.findDirectExpression(Expressions.MethodName)?.concatTokens();
    if (methodStatement === undefined || methodName?.toUpperCase() !== "CONSTRUCTOR") {
      return;
    }

    const classDefinition = input.scope.findClassDefinition(input.scope.getName());
    const superName = classDefinition?.getSuperClass();
    if (classDefinition === undefined || superName === undefined || superName.toUpperCase() === "OBJECT") {
      return;
    }

    const statements = method.findAllStatementNodes();
    for (const s of statements) {
      const type = s.get();
      if (type instanceof Unknown || type instanceof MacroCall
          || s.getFirstToken().getStart() instanceof VirtualPosition) {
        return;
      }
    }

    const callIndex = statements.findIndex(s => SuperConstructorCall.isSuperConstructorCall(s));
    // at most one issue is reported per constructor
    if (callIndex < 0) {
      const message = "The constructor of a subclass must call SUPER->CONSTRUCTOR";
      input.issues.push(syntaxIssue(input, methodStatement.getFirstToken(), message));
      return;
    }

    // the statements up to and including the call, the call cannot pass instance attributes either,
    // declarations can refer to instance attributes for typing, eg. DATA ls_row LIKE LINE OF mt_table
    const before = statements.slice(1, callIndex + 1)
      .filter(s => !(s.get() instanceof NativeSQL) && !SuperConstructorCall.isDeclaration(s));
    const offending = SuperConstructorCall.findInstanceAccess(before, classDefinition, scopeNode, input);
    if (offending !== undefined) {
      const message = "Instance attributes, instance methods and ME can only be accessed after SUPER->CONSTRUCTOR is called";
      input.issues.push(syntaxIssue(input, offending, message));
    }
  }

  private static isDeclaration(statement: StatementNode): boolean {
    const type = statement.get();
    return type instanceof Statements.Data
      || type instanceof Statements.DataBegin
      || type instanceof Statements.DataEnd
      || type instanceof Statements.Constant
      || type instanceof Statements.ConstantBegin
      || type instanceof Statements.ConstantEnd
      || type instanceof Statements.Type
      || type instanceof Statements.TypeBegin
      || type instanceof Statements.TypeEnd
      || type instanceof Statements.Static
      || type instanceof Statements.StaticBegin
      || type instanceof Statements.StaticEnd
      || type instanceof Statements.IncludeType
      || type instanceof Statements.FieldSymbol;
  }

  private static isSuperConstructorCall(statement: StatementNode): boolean {
    const tokens = statement.getTokens();
    for (let i = 0; i < tokens.length - 2; i++) {
      if (tokens[i].getStr().toUpperCase() === "SUPER"
          && tokens[i + 1].getStr() === "->"
          && tokens[i + 2].getStr().toUpperCase() === "CONSTRUCTOR") {
        return true;
      }
    }
    return false;
  }

  /** returns the first offending token */
  private static findInstanceAccess(
    statements: StatementNode[],
    classDefinition: IClassDefinition,
    scopeNode: ISpaghettiScopeNode | undefined,
    input: SyntaxInput): AbstractToken | undefined {

    const instance = SuperConstructorCall.listInstanceMembers(classDefinition, input);
    const references = SuperConstructorCall.listReferences(scopeNode, input.filename);

    for (const statement of statements) {
      const tokens = statement.getTokens();
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (SuperConstructorCall.isMe(tokens, i)) {
          return token;
        }
        const resolved = references.get(SuperConstructorCall.key(token));
        if (resolved !== undefined
            && resolved.some(r => instance.has(r))
            && SuperConstructorCall.isOwnAccess(tokens, i)) {
          return token;
        }
      }
    }
    return undefined;
  }

  /** ME used as a value, me->component is allowed for constants and static components,
   *  instance components are found via the references */
  private static isMe(tokens: readonly AbstractToken[], index: number): boolean {
    const token = tokens[index];
    if (!(token instanceof IdentifierToken) || token.getStr().toUpperCase() !== "ME") {
      return false;
    }
    const prev = tokens[index - 1];
    if (prev !== undefined && (prev instanceof Dash || ["->", "=>", "~"].includes(prev.getStr()))) {
      return false;
    }
    return tokens[index + 1]?.getStr() !== "->";
  }

  /** the member is accessed via the implicit or explicit self reference, not via another object or class */
  private static isOwnAccess(tokens: readonly AbstractToken[], index: number): boolean {
    const prev = tokens[index - 1];
    if (prev === undefined) {
      return true;
    } else if (prev.getStr() === "->") {
      return tokens[index - 2]?.getStr().toUpperCase() === "ME";
    }
    return !(prev instanceof Dash || ["=>", "~"].includes(prev.getStr()));
  }

  /** instance attributes and methods of the class, its super classes and implemented interfaces */
  private static listInstanceMembers(classDefinition: IClassDefinition, input: SyntaxInput): Set<Identifier> {
    const ret = new Set<Identifier>();
    const visited = new Set<string>();
    const stack: (IClassDefinition | IInterfaceDefinition)[] = [classDefinition];
    while (stack.length > 0) {
      const current = stack.pop()!;
      const name = current.getName().toUpperCase();
      if (visited.has(name)) {
        continue;
      }
      visited.add(name);
      for (const a of current.getAttributes().getInstance()) {
        ret.add(a);
      }
      for (const m of current.getMethodDefinitions().getAll()) {
        if (m.isStatic() === false) {
          ret.add(m);
        }
      }
      for (const i of current.getImplementing()) {
        const intf = input.scope.findInterfaceDefinition(i.name);
        if (intf !== undefined) {
          stack.push(intf);
        }
      }
      if ("getSuperClass" in current) {
        const sup = input.scope.findClassDefinition(current.getSuperClass());
        if (sup !== undefined) {
          stack.push(sup);
        }
      }
    }
    return ret;
  }

  /** resolved references of the method body by token position */
  private static listReferences(node: ISpaghettiScopeNode | undefined, filename: string): Map<string, Identifier[]> {
    const ret = new Map<string, Identifier[]>();
    const stack: ISpaghettiScopeNode[] = node ? [node] : [];
    while (stack.length > 0) {
      const current = stack.pop()!;
      stack.push(...current.getChildren());
      for (const r of current.getData().references) {
        if (r.resolved === undefined || r.position.getFilename() !== filename) {
          continue;
        }
        const key = SuperConstructorCall.key(r.position.getToken());
        const list = ret.get(key) ?? [];
        list.push(r.resolved);
        ret.set(key, list);
      }
    }
    return ret;
  }

  private static key(token: AbstractToken): string {
    return token.getRow() + ":" + token.getCol();
  }

}
