import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {InlineData} from "../expressions/inline_data";
import {AbstractType} from "../../types/basic/_abstract_type";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";

export class WhenType implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const nameToken = node.findFirstExpression(Expressions.ClassName)?.getFirstToken();
    if (nameToken === undefined) {
      return undefined;
    }

    let type: AbstractType | undefined = undefined;
    const className = nameToken.getStr();
    const found = scope.findObjectDefinition(className);
    if (found === undefined && scope.getDDIC().inErrorNamespace(className) === false) {
      type = new VoidType(className);
    } else if (found === undefined) {
      throw new Error("Class " + className + " not found");
    } else {
      type = new ObjectReferenceType(found);
    }

    const target = node?.findDirectExpression(Expressions.Target);
    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      new InlineData().runSyntax(inline, scope, filename, type);
    } else if (target) {
      new Target().runSyntax(target, scope, filename);
    }
  }
}