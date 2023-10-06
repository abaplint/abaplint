import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {FSTarget} from "../expressions/fstarget";
import {AnyType, CharacterType, VoidType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Dynamic} from "../expressions/dynamic";
import {TypeUtils} from "../_type_utils";

export class Assign implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const assignSource = node.findDirectExpression(Expressions.AssignSource);
    const sources = assignSource?.findDirectExpressions(Expressions.Source) || [];
    const theSource = sources[sources.length - 1];

    let sourceType: AbstractType | undefined = undefined;
    const firstAssign = assignSource?.getChildren()[0];
    const secondAssign = assignSource?.getChildren()[1];
    const thirdAssign = assignSource?.getChildren()[2];
    if (secondAssign?.concatTokens() === "=>" && firstAssign && thirdAssign?.get() instanceof Expressions.Dynamic) {
      const name = firstAssign.concatTokens();
      const found = scope.findObjectDefinition(name) === undefined || scope.findVariable(name);
      if (found === undefined && scope.getDDIC().inErrorNamespace(name)) {
        throw new Error(secondAssign.concatTokens() + " not found");
      }
      sourceType = new VoidType("Dynamic");
    } else {
      sourceType = new Source().runSyntax(theSource, scope, filename);
    }

    if (assignSource?.getFirstChild()?.concatTokens() === "COMPONENT") {
      const componentSource = sources[sources.length - 2];
      const componentType = new Source().runSyntax(componentSource, scope, filename);
      if (new TypeUtils(scope).isAssignable(componentType, new CharacterType(30)) === false) {
        throw new Error("component name must be charlike");
      }
    }

    if (sourceType === undefined || assignSource?.findDirectExpression(Expressions.Dynamic)) {
      sourceType = new AnyType();
    }
    for (const d of assignSource?.findAllExpressions(Expressions.Dynamic) || []) {
      new Dynamic().runSyntax(d, scope, filename);
    }

    const target = node.findDirectExpression(Expressions.FSTarget);
    if (target) {
      new FSTarget().runSyntax(target, scope, filename, sourceType);
    }

    for (const s of node.findAllExpressions(Expressions.Source)) {
      if (s === theSource) {
        continue;
      }
      new Source().runSyntax(s, scope, filename);
    }

  }
}