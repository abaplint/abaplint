import {ExpressionNode} from "../../nodes";
import {AnyType, CLikeType, CharacterType, NumericGenericType, NumericType, StringType, UnknownType, VoidType} from "../../types/basic";
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
      const type = new Source().runSyntax(s, scope, filename, StringType.get());
      if (type === undefined) {
        throw new Error("No target type determined");
      } else if (typeUtils.isCharLike(type) === false && typeUtils.isHexLike(type) === false) {
        throw new Error("Not character like, " + type.constructor.name);
      }

      const format = templateSource.findDirectExpression(Expressions.StringTemplateFormatting);
      const formatConcat = format?.concatTokens();
      for (const formatSource of format?.findAllExpressions(Expressions.Source) || []) {
        new Source().runSyntax(formatSource, scope, filename);
      }

      if (formatConcat?.includes("ALPHA = ")
          && !(type instanceof UnknownType)
          && !(type instanceof VoidType)
          && !(type instanceof StringType)
          && !(type instanceof CLikeType)
          && !(type instanceof CharacterType)
          && !(type instanceof NumericGenericType)
          && !(type instanceof NumericType)
          && !(type instanceof AnyType)) {
        throw new Error("Cannot apply ALPHA to this type");
      }
    }

    return StringType.get();
  }
}