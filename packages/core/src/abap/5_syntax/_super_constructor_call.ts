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
    if (callIndex < 0) {
      const message = "The constructor of a subclass must call SUPER->CONSTRUCTOR";
      input.issues.push(syntaxIssue(input, methodStatement.getFirstToken(), message));
    }

    // the statements up to and including the call, the call cannot pass instance attributes either
    const before = statements.slice(1, callIndex < 0 ? statements.length - 1 : callIndex + 1)
      .filter(s => !(s.get() instanceof NativeSQL));
    const offending = SuperConstructorCall.findInstanceAccess(before, classDefinition, scopeNode, input);
    for (const token of offending) {
      const message = "Instance attributes, instance methods and ME can only be accessed after SUPER->CONSTRUCTOR is called";
      input.issues.push(syntaxIssue(input, token, message));
    }
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

  /** returns the first offending token of each statement */
  private static findInstanceAccess(
    statements: StatementNode[],
    classDefinition: IClassDefinition,
    scopeNode: ISpaghettiScopeNode | undefined,
    input: SyntaxInput): AbstractToken[] {

    const instance = SuperConstructorCall.listInstanceMembers(classDefinition, input);
    const references = SuperConstructorCall.listReferences(scopeNode, input.filename);

    const ret: AbstractToken[] = [];
    for (const statement of statements) {
      const tokens = statement.getTokens();
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (SuperConstructorCall.isMe(tokens, i)) {
          ret.push(token);
          break;
        }
        const resolved = references.get(SuperConstructorCall.key(token));
        if (resolved !== undefined
            && resolved.some(r => instance.has(r))
            && SuperConstructorCall.isOwnAccess(tokens, i)) {
          ret.push(token);
          break;
        }
      }
    }
    return ret;
  }

  private static isMe(tokens: readonly AbstractToken[], index: number): boolean {
    const token = tokens[index];
    if (!(token instanceof IdentifierToken) || token.getStr().toUpperCase() !== "ME") {
      return false;
    }
    const prev = tokens[index - 1];
    return prev === undefined
      || !(prev instanceof Dash || ["->", "=>", "~"].includes(prev.getStr()));
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

  private static listInstanceMembers(classDefinition: IClassDefinition, input: SyntaxInput): Set<Identifier> {
    const ret = new Set<Identifier>();
    const visited = new Set<string>();
    let current: IClassDefinition | undefined = classDefinition;
    while (current !== undefined && visited.has(current.getName().toUpperCase()) === false) {
      visited.add(current.getName().toUpperCase());
      for (const a of current.getAttributes().getInstance()) {
        ret.add(a);
      }
      for (const m of current.getMethodDefinitions().getAll()) {
        if (m.isStatic() === false) {
          ret.add(m);
        }
      }
      current = input.scope.findClassDefinition(current.getSuperClass());
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
