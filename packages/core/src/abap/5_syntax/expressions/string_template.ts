import {ExpressionNode} from "../../nodes";
import {StringType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Expressions from "../../2_statements/expressions";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";
import {TypeUtils} from "../_type_utils";

export class StringTemplate {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): AbstractType {
    const typeUtils = new TypeUtils(scope);

    for (const templateSource of node.findAllExpressions(Expressions.StringTemplateSource)) {
      const s = templateSource.findDirectExpression(Expressions.Source);
      const type = new Source().runSyntax(s, scope, filename, new StringType({qualifiedName: "STRING"}));
      if (type === undefined) {
        throw new Error("No target type determined");
      } else if (typeUtils.isCharLike(type) === false && typeUtils.isHexLike(type) === false) {
        throw new Error("Not character like, " + type.constructor.name);
      }

      for (const formatSource of templateSource.findDirectExpression(Expressions.StringTemplateFormatting)
        ?.findAllExpressions(Expressions.Source) || []) {
        new Source().runSyntax(formatSource, scope, filename);
      }
    }

    return new StringType({qualifiedName: "STRING"});
  }
}