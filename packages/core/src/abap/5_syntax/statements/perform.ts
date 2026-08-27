import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import {ExpressionNode, StatementNode} from "../../nodes";
import {ReferenceType} from "../_reference";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AssertError} from "../assert_error";
import {Dynamic} from "../expressions/dynamic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {TypeUtils} from "../_type_utils";
import {IdentifierMeta, TypedIdentifier} from "../../types/_typed_identifier";

type Parameter = {node: ExpressionNode, type: AbstractType | undefined};

export class Perform implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    if (!(node.get() instanceof Statements.Perform)) {
      throw new AssertError("checkPerform unexpected node type");
    }

    ////////////////////////////
    // check parameters are defined

    const changing: Parameter[] = [];
    for (const c of node.findDirectExpressions(Expressions.PerformChanging)) {
      for (const s of c.findDirectExpressions(Expressions.Target)) {
        changing.push({node: s, type: Target.runSyntax(s, input)});
      }
    }
    const tables: Parameter[] = [];
    for (const t of node.findDirectExpressions(Expressions.PerformTables)) {
      for (const s of t.findDirectExpressions(Expressions.Source)) {
        tables.push({node: s, type: Source.runSyntax(s, input)});
      }
    }
    const using: Parameter[] = [];
    for (const u of node.findDirectExpressions(Expressions.PerformUsing)) {
      for (const s of u.findDirectExpressions(Expressions.SimpleSource3)) {
        using.push({node: s, type: Source.runSyntax(s, input)});
      }
    }

    ////////////////////////////
    // find FORM definition

    if (node.findFirstExpression(Expressions.IncludeName)) {
      return; // in external program, not checked, todo
    }

    const dynamic = node.findFirstExpression(Expressions.Dynamic);
    if (dynamic) {
      Dynamic.runSyntax(dynamic, input);
      return; // todo, maybe some parts can be checked
    }

    const expr = node.findFirstExpression(Expressions.FormName);
    if (expr === undefined) {
      return; // it might be a dynamic call
    }

    const name = expr.concatTokens();

    const found = input.scope.findFormDefinition(name);
    if (found === undefined) {
      const message = "FORM definition \"" + name + "\" not found";
      input.issues.push(syntaxIssue(input, expr.getFirstToken(), message));
      return;
    }

    input.scope.addReference(expr.getFirstToken(), found, ReferenceType.FormReference, input.filename);

    ////////////////////////////
    // check parameters match

    // USING and CHANGING are interchangeable, the actual parameters form a single positional list
    if (this.checkParameters(node, tables, found.getTablesParameters(), "TABLES", input) === false) {
      return;
    }
    const formal = found.getUsingParameters().concat(found.getChangingParameters());
    this.checkParameters(node, using.concat(changing), formal, "USING/CHANGING", input);
  }

  // returns false if an issue was reported
  private checkParameters(node: StatementNode, actual: Parameter[], formal: readonly TypedIdentifier[],
                          kind: string, input: SyntaxInput): boolean {

    if (actual.length !== formal.length) {
      const message = `PERFORM, expected ${formal.length} ${kind} parameters, found ${actual.length}`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return false;
    }

    const typeUtils = new TypeUtils(input.scope);
    for (let i = 0; i < actual.length; i++) {
      const {node: source, type} = actual[i];
      if (type === undefined) {
        continue;
      }
      const parameter = formal[i];
      const structureTyping = parameter.getMeta().includes(IdentifierMeta.FormParameterStructure);
      const assignable = structureTyping
        ? typeUtils.isAssignableStructureTyping(type, parameter.getType(), source)
        : typeUtils.isAssignableStrict(type, parameter.getType(), source);
      if (assignable === false) {
        const message = `PERFORM parameter type not compatible, ${parameter.getName()}`;
        input.issues.push(syntaxIssue(input, source.getFirstToken(), message));
        return false;
      }
    }

    return true;
  }
}