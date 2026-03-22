import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {Source} from "./source";
import {Target} from "./target";
import {FieldChain} from "./field_chain";
import {ReferenceType} from "../_reference";
import {SyntaxInput} from "../_syntax_input";

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
    for (const paramList of node.findDirectExpressions(Expressions.ParameterListT)) {
      for (const param of paramList.findDirectExpressions(Expressions.ParameterT)) {
        const t = param.findDirectExpression(Expressions.Target);
        if (t) {
          Target.runSyntax(t, input);
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
