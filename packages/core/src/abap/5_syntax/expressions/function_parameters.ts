import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, TokenNode} from "../../nodes";
import {AbstractToken} from "../../1_lexer/tokens/abstract_token";
import {Source} from "./source";
import {Target} from "./target";
import {FieldChain} from "./field_chain";
import {ReferenceType} from "../_reference";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {IdentifierMeta} from "../../types/_typed_identifier";
import {DataReference} from "../../types/basic";
import {FunctionModuleDefinition, FunctionModuleParameterDirection} from "../../types/function_module_definition";

export class FunctionParameters {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput, functionName?: string): void {
    this.checkDuplicates(node, input);

    // EXPORTING: process sources in each FunctionExportingParameter
    for (const param of node.findAllExpressions(Expressions.FunctionExportingParameter)) {
      const s = param.findDirectExpression(Expressions.Source);
      const s3 = param.findDirectExpression(Expressions.SimpleSource3);
      for (const source of [s, s3]) {
        if (source && Source.runSyntax(source, input) instanceof DataReference) {
          input.referenceMayChange?.(source, input.scope, false, "referent");
        }
      }
    }

    // IMPORTING / CHANGING / TABLES: process targets in each ParameterT
    const changingList = node.findExpressionAfterToken("CHANGING");
    const tablesList = node.findExpressionAfterToken("TABLES");
    const importingList = node.findExpressionAfterToken("IMPORTING");
    let definition: FunctionModuleDefinition | null | undefined;
    for (const paramList of node.findDirectExpressions(Expressions.ParameterListT)) {
      for (const param of paramList.findDirectExpressions(Expressions.ParameterT)) {
        const t = param.findDirectExpression(Expressions.Target);
        if (t) {
          const type = Target.runSyntax(t, input);
          let effect: "tables" | "write" | "output" = paramList === tablesList ? "tables" : "write";
          if (paramList === importingList && type instanceof DataReference && functionName !== undefined) {
            if (definition === undefined) {
              definition = input.scope.findFunctionModule(functionName) ?? null;
            }
            const name = param.findDirectExpression(Expressions.ParameterName)?.getFirstToken().getUpperStr().replace(/^!/, "");
            if (definition?.getParameters().some(p => p.direction === FunctionModuleParameterDirection.exporting
                && p.name.toUpperCase() === name && p.passByValue)) {
              effect = "output";
            }
          }
          input.referenceMayChange?.(t, input.scope, effect !== "output", effect);
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
