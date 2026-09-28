import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {BuiltIn} from "../_builtin";
import {ObjectOriented} from "../_object_oriented";
import {ObjectReferenceType} from "../../types/basic";
import {LanguageVersion, Release, releaseAtLeast} from "../../../version";

export class Case implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    // just recurse
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
      checkCaseOperand(s, input);
    }
  }
}

// Before 7.40 SP02 the operands of CASE and WHEN are enhanced functional operand positions: besides
// data objects and functional methods, only built-in functions with exactly one unnamed argument are allowed
export function checkCaseOperand(source: ExpressionNode, input: SyntaxInput): void {
  if (releaseAtLeast(input.scope.getRelease(), Release.v740sp02)
      || input.scope.getLanguageVersion() === LanguageVersion.Cloud
      || input.scope.getOpenABAP()) {
    return;
  }

  const chain = source.findDirectExpression(Expressions.MethodCallChain);
  if (chain === undefined || source.getChildren().length !== 1 || chain.getChildren().length !== 1) {
    return;
  }
  const call = chain.findDirectExpression(Expressions.MethodCall);
  const nameToken = call?.findDirectExpression(Expressions.MethodName)?.getFirstToken();
  const name = nameToken?.getStr();
  if (nameToken === undefined || BuiltIn.searchBuiltin(name) === undefined || BuiltIn.hasUnnamedArgument(name)) {
    return;
  }

  // a method of the enclosing class takes precedence over the built-in function
  const meType = input.scope.findVariable("me")?.getType();
  if (meType instanceof ObjectReferenceType) {
    const def = input.scope.findObjectDefinition(meType.getIdentifierName());
    if (new ObjectOriented(input.scope).searchMethodName(def, name).method !== undefined) {
      return;
    }
  }

  const message = "Built-in function " + name + " not allowed as CASE/WHEN operand before v740sp02";
  input.issues.push(syntaxIssue(input, nameToken, message));
}
