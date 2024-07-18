import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {FSTarget} from "../expressions/fstarget";
import {AnyType, CharacterType, VoidType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Dynamic} from "../expressions/dynamic";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Assign implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const assignSource = node.findDirectExpression(Expressions.AssignSource);
    const sources: ExpressionNode[] = assignSource?.findDirectExpressionsMulti([Expressions.Source, Expressions.SimpleSource3]) || [];
    const theSource = sources[sources.length - 1];

    let sourceType: AbstractType | undefined = undefined;
    const firstAssign = assignSource?.getChildren()[0];
    const secondAssign = assignSource?.getChildren()[1];
    const thirdAssign = assignSource?.getChildren()[2];
    if (secondAssign?.concatTokens() === "=>" && firstAssign && thirdAssign?.get() instanceof Expressions.Dynamic) {
      const name = firstAssign.concatTokens();
      const found = input.scope.findClassDefinition(name) || input.scope.findVariable(name);
      if (found === undefined && input.scope.getDDIC().inErrorNamespace(name) && name.startsWith("(") === false) {
        const message = name + " not found, dynamic";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      sourceType = new VoidType("Dynamic");
    } else {
      sourceType = new Source().runSyntax(theSource, input);
    }

    if (assignSource?.getChildren().length === 5
        && assignSource?.getFirstChild()?.concatTokens().toUpperCase() === "COMPONENT") {
      const componentSource = sources[sources.length - 2];
      const componentType = new Source().runSyntax(componentSource, input);
      if (new TypeUtils(input.scope).isAssignable(componentType, new CharacterType(30)) === false) {
        const message = "component name must be charlike";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

    if (sourceType === undefined || assignSource?.findDirectExpression(Expressions.Dynamic)) {
      sourceType = new AnyType();
    }
    for (const d of assignSource?.findAllExpressions(Expressions.Dynamic) || []) {
      new Dynamic().runSyntax(d, input);
    }

    const target = node.findDirectExpression(Expressions.FSTarget);
    if (target) {
      if (assignSource?.getFirstChild()?.concatTokens().toUpperCase() === "COMPONENT") {
        new FSTarget().runSyntax(target, input, new AnyType());
      } else {
        new FSTarget().runSyntax(target, input, sourceType);
      }
    }

    for (const s of node.findAllExpressions(Expressions.Source)) {
      if (s === theSource) {
        continue;
      }
      new Source().runSyntax(s, input);
    }

  }
}