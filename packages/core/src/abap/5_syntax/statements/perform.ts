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
import {DataReference, TableType, UnknownType, VoidType} from "../../types/basic";

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

    const external = node.findFirstExpression(Expressions.IncludeName);
    const dynamic = node.findFirstExpression(Expressions.Dynamic);
    const expr = node.findFirstExpression(Expressions.FormName);
    const name = expr?.concatTokens();
    const found = external || dynamic || name === undefined ? undefined : input.scope.findFormDefinition(name);
    const actuals = using.concat(changing);
    if (input.referenceMayChange) {
      const local = node.findDirectTokenByText("PROGRAM") === undefined ? found : undefined;
      const inputs = local?.getUsingParameters() ?? [];
      const outputs = local?.getChangingParameters() ?? [];
      for (const [index, actual] of actuals.entries()) {
        // Only the formal parameter controls whether the value is copied back.
        const inputOnly = index < inputs.length;
        const formal = inputOnly ? inputs[index] : outputs[index - inputs.length];
        const byValue = formal?.getMeta().includes(IdentifierMeta.PassByValue) === true;
        if (!(inputOnly && byValue)) {
          const type = formal?.getType();
          const tables = type instanceof TableType
            || (actual.type instanceof TableType && (type === undefined || type instanceof UnknownType || type instanceof VoidType));
          input.referenceMayChange(actual.node, input.scope, !byValue, tables ? "tables" : "write");
        } else if (actual.type instanceof DataReference) {
          input.referenceMayChange(actual.node, input.scope, false, "referent");
        }
      }
      for (const actual of tables) {
        input.referenceMayChange(actual.node, input.scope, false, "tables");
      }
      const scheduled = node.findDirectTokenByText("COMMIT") ? "onCommit" : node.findDirectTokenByText("ROLLBACK") ? "onRollback" : "routine";
      input.referenceMayChange(undefined, input.scope, false, scheduled);
    }
    if (external) {
      return; // in external program, not checked, todo
    }
    if (dynamic) {
      Dynamic.runSyntax(dynamic, input);
      return; // todo, maybe some parts can be checked
    }

    if (expr === undefined || name === undefined) {
      return; // it might be a dynamic call
    }

    if (found === undefined) {
      const message = "FORM definition \"" + name + "\" not found";
      input.issues.push(syntaxIssue(input, expr.getFirstToken(), message));
      return;
    }

    input.scope.addReference(expr.getFirstToken(), found, ReferenceType.FormReference, input.filename);

    ////////////////////////////
    // check parameters match

    // deferred, the FORM might be defined after the PERFORM, its parameters are only typed
    // once the FORM statement itself has been traversed
    input.deferred.push(() => {
      // look up again, the definition is replaced when the FORM statement is traversed
      const def = input.scope.findFormDefinition(name) ?? found;
      if (this.checkParameters(node, tables, def.getTablesParameters(), "TABLES", input) === false) {
        return;
      }
      // USING and CHANGING are interchangeable, the actual parameters form a single positional list
      const formal = def.getUsingParameters().concat(def.getChangingParameters());
      this.checkParameters(node, actuals, formal, "USING/CHANGING", input);
    });
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
