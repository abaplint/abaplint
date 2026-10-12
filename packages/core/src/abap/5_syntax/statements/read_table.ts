import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {VoidType, TableType, IntegerType, DataReference, AnyType, UnknownType, StructureType, ObjectReferenceType, StringType, TableAccessType} from "../../types/basic";
import {Source} from "../expressions/source";
import {InlineData} from "../expressions/inline_data";
import {Target} from "../expressions/target";
import {FSTarget} from "../expressions/fstarget";
import {ComponentCompareSimple} from "../expressions/component_compare_simple";
import {StatementSyntax} from "../_statement_syntax";
import {AbstractType} from "../../types/basic/_abstract_type";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {BuiltIn} from "../_builtin";
import {ObjectOriented} from "../_object_oriented";
import {Release, releaseAtLeast} from "../../../version";

export class ReadTable implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const concat = node.concatTokens().toUpperCase();
    const sources = node.findDirectExpressionsMulti([Expressions.Source, Expressions.SimpleSource2]);

    const firstSource = sources[0];
    const sourceType = firstSource ? Source.runSyntax(firstSource, input) : undefined;

    if (sourceType === undefined) {
      const message = "No source type determined, read table";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    } else if (sourceType instanceof UnknownType) {
      // do nothing, ok
    } else if (!(sourceType instanceof TableType) && !(sourceType instanceof VoidType)) {
      const message = "Read table, not a table type";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    let rowType: AbstractType = sourceType;
    if (rowType instanceof TableType) {
      rowType = rowType.getRowType();
    }

    const components = node.findDirectExpression(Expressions.ComponentCompareSimple);
    if (components !== undefined) {
      ComponentCompareSimple.runSyntax(components, input, rowType);
      const keyMessage = this.checkKeyOperands(components, input);
      if (keyMessage !== undefined) {
        input.issues.push(syntaxIssue(input, node.getFirstToken(), keyMessage));
        return;
      }
    }

    const indexSource = node.findExpressionAfterToken("INDEX");
    if (indexSource) {
      const indexType = Source.runSyntax(indexSource, input);
      if (new TypeUtils(input.scope).isAssignable(indexType, IntegerType.get()) === false) {
        const message = "READ TABLE, INDEX must be simple, got " + indexType?.constructor.name;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      } else if (sourceType instanceof TableType && sourceType.getAccessType() === TableAccessType.hashed) {
        const message = "INDEX on hashed table not possible";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

    const fromSource = node.findExpressionAfterToken("FROM");
    if (fromSource) {
      const fromType = Source.runSyntax(fromSource, input);
      if (new TypeUtils(input.scope).isAssignable(fromType, rowType) === false) {
        const message = "READ TABLE, FROM must be compatible";
        input.issues.push(syntaxIssue(input, fromSource.getFirstToken(), message));
        return;
      }
    }

    const afterKey = node.findExpressionAfterToken("KEY");
    for (const s of sources) {
      if (s === firstSource || s === indexSource || s === fromSource) {
        continue;
      }
      const type = Source.runSyntax(s, input);
      if (s === afterKey) {
        if (type instanceof StringType
            || (type instanceof TableType && type.isWithHeader() === false)
            || type instanceof ObjectReferenceType) {
          const message = "Key cannot be string or table or reference";
          input.issues.push(syntaxIssue(input, s.getFirstToken(), message));
          return;
        }
      }
    }

    const target = node.findDirectExpression(Expressions.ReadTableTarget);
    if (target) {
      if (concat.includes(" REFERENCE INTO ")) {
        rowType = new DataReference(rowType);
      }

      const inline = target.findFirstExpression(Expressions.InlineData);
      const fst = target.findDirectExpression(Expressions.FSTarget);
      const t = target.findFirstExpression(Expressions.Target);
      if (inline) {
        InlineData.runSyntax(inline, input, rowType);
      } else if (fst) {
        FSTarget.runSyntax(fst, input, rowType);
      } else if (t) {
        const targetType = Target.runSyntax(t, input);
        if (new TypeUtils(input.scope).isAssignable(rowType, targetType) === false) {
          const message = "Incompatible types";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      }
    }

    if (target === undefined && concat.includes(" TRANSPORTING NO FIELDS ") === false) {
      // if sourceType is void, assume its with header
      if (sourceType instanceof TableType && sourceType.isWithHeader() === false) {
        const message = "READ TABLE, define INTO or TRANSPORTING NO FIELDS";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

    const transporting = node.findDirectExpression(Expressions.TransportingFields);
    if (transporting
        && !(rowType instanceof VoidType)
        && !(rowType instanceof UnknownType)
        && !(rowType instanceof AnyType)) {
      if (!(rowType instanceof StructureType)) {
        const message = "READ TABLE, source not structured";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      for (const t of transporting?.findDirectExpressions(Expressions.FieldSub) || []) {
        const field = t.concatTokens();
        if (field.includes("-")) {
          // todo
          continue;
        }
        if (rowType.getComponentByName(field) === undefined) {
          const message = "READ TABLE, field " + field + " not found in source";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      }
    }

  }

  // before 7.40 a WITH [TABLE] KEY operand is not an expression position, a built-in function from 7.02 on
  // is read as a functional method call there, "method TO_UPPER is unknown" on a system, while
  // functional methods and the older built-in functions like lines( ) are accepted
  private checkKeyOperands(node: ExpressionNode, input: SyntaxInput): string | undefined {
    if (input.scope.getOpenABAP() || releaseAtLeast(input.scope.getRelease(), Release.v740sp02)) {
      return undefined;
    }
    for (const operand of node.findDirectExpressionsMulti([Expressions.Source, Expressions.SimpleSource4])) {
      const chain = operand.getChildren();
      if (chain.length !== 1 || !(chain[0] instanceof ExpressionNode) || !(chain[0].get() instanceof Expressions.MethodCallChain)) {
        continue;
      }
      const calls = chain[0].getChildren();
      if (calls.length !== 1 || !(calls[0] instanceof ExpressionNode) || !(calls[0].get() instanceof Expressions.MethodCall)) {
        continue;
      }
      const name = calls[0].findDirectExpression(Expressions.MethodName)?.concatTokens();
      if (name === undefined || BuiltIn.methods[name.toUpperCase()]?.release === undefined) {
        continue;
      }
      // a method of the same name hides the built-in function
      const enclosing = input.scope.findClassDefinition(input.scope.getEnclosingClassName());
      if (enclosing !== undefined && new ObjectOriented(input.scope).searchMethodName(enclosing, name).method !== undefined) {
        continue;
      }
      return `Built-in function "${name}" cannot be a READ TABLE key operand before 7.40`;
    }
    return undefined;
  }

}
