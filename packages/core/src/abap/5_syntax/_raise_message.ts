import * as Expressions from "../2_statements/expressions";
import {ExpressionNode, StatementNode, TokenNode} from "../nodes";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {IClassDefinition} from "../types/_class_definition";
import {CurrentScope} from "./_current_scope";
import {SyntaxInput, syntaxIssue} from "./_syntax_input";

const T100_INTERFACES = new Set(["IF_T100_MESSAGE", "IF_T100_DYN_MSG"]);
// the root exception classes, they implement IF_MESSAGE and IF_SERIALIZABLE_OBJECT, but not the T100 interfaces
const ROOT_EXCEPTIONS = new Set(["CX_ROOT", "CX_STATIC_CHECK", "CX_DYNAMIC_CHECK", "CX_NO_CHECK"]);

/** RAISE EXCEPTION TYPE cx MESSAGE ... and THROW cx( MESSAGE ... ) require the exception class to implement
 *  IF_T100_MESSAGE or IF_T100_DYN_MSG, and with RAISE EXCEPTION the constructor parameter TEXTID cannot be
 *  passed in addition to MESSAGE, see the ABAP keyword documentation for RAISE EXCEPTION, MESSAGE.
 *  The interface check only reports when the full class hierarchy is known, void classes and void interfaces
 *  in the hierarchy are skipped, except for the root exception classes. */
export class RaiseMessage {

  public static checkRaise(node: StatementNode, input: SyntaxInput): void {
    const classTok = node.findDirectExpression(Expressions.ClassName)?.getFirstToken();
    if (classTok === undefined || RaiseMessage.hasMessage(node) === false) {
      return;
    }

    for (const p of node.findDirectExpression(Expressions.ParameterListS)?.findDirectExpressions(Expressions.ParameterS) ?? []) {
      const name = p.findDirectExpression(Expressions.ParameterName)?.getFirstToken();
      if (name?.getStr().toUpperCase() === "TEXTID") {
        const message = "RAISE EXCEPTION with MESSAGE, TEXTID cannot be passed";
        input.issues.push(syntaxIssue(input, name, message));
        return;
      }
    }

    RaiseMessage.checkClass(classTok.getStr(), input, classTok);
  }

  public static checkThrow(node: ExpressionNode, input: SyntaxInput): void {
    const classTok = node.findDirectExpression(Expressions.ClassName)?.getFirstToken();
    if (classTok === undefined || node.findDirectExpression(Expressions.MessageSource) === undefined) {
      return;
    }
    RaiseMessage.checkClass(classTok.getStr(), input, classTok);
  }

  /** MESSAGE msg or MESSAGE ID, but not USING MESSAGE */
  private static hasMessage(node: StatementNode): boolean {
    const children = node.getChildren();
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (c instanceof TokenNode && c.getFirstToken().getStr().toUpperCase() === "MESSAGE") {
        const previous = children[i - 1];
        if (previous === undefined || previous.getFirstToken().getStr().toUpperCase() !== "USING") {
          return true;
        }
      }
    }
    return false;
  }

  private static checkClass(className: string, input: SyntaxInput, classTok: AbstractToken): void {
    const def = input.scope.findClassDefinition(className);
    if (def === undefined) {
      return;
    }
    if (RaiseMessage.isT100(def, input.scope, new Set()) === false) {
      const message = "Exception class " + def.getName().toUpperCase() +
        " must implement IF_T100_MESSAGE or IF_T100_DYN_MSG to be raised with MESSAGE";
      input.issues.push(syntaxIssue(input, classTok, message));
    }
  }

  /** true or false when known, undefined when the hierarchy contains void parts */
  private static isT100(def: IClassDefinition, scope: CurrentScope, visited: Set<string>): boolean | undefined {
    const upper = def.getName().toUpperCase();
    if (visited.has(upper)) {
      return undefined;
    }
    visited.add(upper);

    let unknown = false;
    const interfaces = def.getImplementing().map(i => i.name.toUpperCase());
    const seen = new Set<string>();
    while (interfaces.length > 0) {
      const name = interfaces.pop()!;
      if (seen.has(name)) {
        continue;
      }
      seen.add(name);
      if (T100_INTERFACES.has(name)) {
        return true;
      }
      const idef = scope.findInterfaceDefinition(name);
      if (idef === undefined) {
        unknown = true;
      } else {
        interfaces.push(...idef.getImplementing().map(i => i.name.toUpperCase()));
      }
    }

    const superName = def.getSuperClass()?.toUpperCase();
    if (superName !== undefined) {
      const superDef = scope.findClassDefinition(superName);
      if (superDef !== undefined) {
        const res = RaiseMessage.isT100(superDef, scope, visited);
        if (res === true) {
          return true;
        } else if (res === undefined) {
          unknown = true;
        }
      } else if (ROOT_EXCEPTIONS.has(superName) === false) {
        unknown = true;
      }
    } else if (ROOT_EXCEPTIONS.has(upper) === false) {
      // not an exception class, reported elsewhere or not at all
      unknown = true;
    }

    return unknown ? undefined : false;
  }
}
