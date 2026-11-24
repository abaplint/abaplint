import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, TokenNode} from "../../nodes";
import {AbstractToken} from "../../1_lexer/tokens/abstract_token";
import {Source} from "./source";
import {Target} from "./target";
import {FieldChain} from "./field_chain";
import {ReferenceType} from "../_reference";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {IdentifierMeta} from "../../types/_typed_identifier";

export class FunctionParameters {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): void {
    this.checkDuplicates(node, input);

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
          input.referenceMayChange?.(t, input.scope);
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

  /** a parameter or exception name given twice within the same section, EXPORTING, IMPORTING, TABLES, CHANGING or EXCEPTIONS */
  private static checkDuplicates(node: ExpressionNode, input: SyntaxInput): void {
    const sections: ExpressionNode[] = [];
    const exporting = node.findDirectExpression(Expressions.FunctionExporting);
    if (exporting) {
      sections.push(exporting);
    }
    sections.push(...node.findDirectExpressions(Expressions.ParameterListT));
    for (const section of sections) {
      const supplied = new Set<string>();
      for (const p of section.getChildren()) {
        const token = p instanceof ExpressionNode ? p.findDirectExpression(Expressions.ParameterName)?.getFirstToken() : undefined;
        this.checkDuplicate(token, token?.getStr().toUpperCase(), supplied, "Function module parameter", input);
      }
    }

    const exceptions = node.findDirectExpression(Expressions.ParameterListExceptions);
    const supplied = new Set<string>();
    for (const e of exceptions?.findDirectExpressions(Expressions.ParameterException) || []) {
      this.checkDuplicate(e.getFirstToken(), this.exceptionName(e), supplied, "Exception", input);
    }
  }

  private static exceptionName(node: ExpressionNode): string {
    let name = "";
    for (const c of node.getChildren()) {
      if (c instanceof TokenNode && c.getFirstToken().getStr() === "=") {
        break;
      }
      name += c.concatTokens();
    }
    return name.toUpperCase();
  }

  private static checkDuplicate(token: AbstractToken | undefined, name: string | undefined,
                                supplied: Set<string>, what: string, input: SyntaxInput): void {
    if (token === undefined || name === undefined) {
      return;
    } else if (supplied.has(name)) {
      input.issues.push(syntaxIssue(input, token, `${what} "${name}" is supplied more than once`));
    }
    supplied.add(name);
  }
}
