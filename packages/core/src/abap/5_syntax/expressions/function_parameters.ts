import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {Source} from "./source";
import {Target} from "./target";
import {FieldChain} from "./field_chain";
import {ReferenceType} from "../_reference";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {IdentifierMeta} from "../../types/_typed_identifier";

export class FunctionParameters {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): void {

    // EXPORTING: process sources in each FunctionExportingParameter
    for (const param of node.findAllExpressions(Expressions.FunctionExportingParameter)) {
      const s = param.findDirectExpression(Expressions.Source);
      if (s) {
        Source.runSyntax(s, input);
      }
      const s3 = param.findDirectExpression(Expressions.SimpleSource3);
      if (s3) {
        Source.runSyntax(s3, input);
      }
    }

    // IMPORTING / CHANGING / TABLES: process targets in each ParameterT
    const changingList = node.findExpressionAfterToken("CHANGING");
    for (const paramList of node.findDirectExpressions(Expressions.ParameterListT)) {
      for (const param of paramList.findDirectExpressions(Expressions.ParameterT)) {
        const t = param.findDirectExpression(Expressions.Target);
        if (t) {
          Target.runSyntax(t, input);
        }

        if (paramList === changingList && t !== undefined) {
// hmm, does this do the scoping correctly? handle constants etc? todo
          const found = input.scope.findVariable(t.concatTokens());
          if (found && found.getMeta().includes(IdentifierMeta.ReadOnly)) {
            const message = `"${t.concatTokens()}" cannot be modified, it is readonly`;
            input.issues.push(syntaxIssue(input, t.getFirstToken(), message));
          }
        }
      }
    }

    // EXCEPTIONS: process field chains and optional MESSAGE targets
    for (const exc of node.findAllExpressions(Expressions.ParameterException)) {
      for (const s of exc.findDirectExpressions(Expressions.SimpleFieldChain)) {
        FieldChain.runSyntax(s, input, ReferenceType.DataReadReference);
      }
      const t = exc.findDirectExpression(Expressions.Target);
      if (t) {
        Target.runSyntax(t, input);
      }
    }
  }
}
