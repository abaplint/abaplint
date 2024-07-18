import {ExpressionNode} from "../../nodes";
import {AnyType, CLikeType, CharacterType, NumericGenericType, NumericType, StringType, StructureType, UnknownType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {TypeUtils} from "../_type_utils";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class StringTemplate {
  public runSyntax(node: ExpressionNode, input: SyntaxInput): AbstractType {
    const typeUtils = new TypeUtils(input.scope);
    const ret = StringType.get();

    for (const templateSource of node.findAllExpressions(Expressions.StringTemplateSource)) {
      const s = templateSource.findDirectExpression(Expressions.Source);
      const type = new Source().runSyntax(s, input, ret);
      if (type === undefined) {
        const message = "No target type determined";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return new VoidType(CheckSyntaxKey);
      } else if ((typeUtils.isCharLike(type) === false && typeUtils.isHexLike(type) === false)
          || type instanceof StructureType) {
        const message = "String template, not character like, " + type.constructor.name;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return new VoidType(CheckSyntaxKey);
      }

      const format = templateSource.findDirectExpression(Expressions.StringTemplateFormatting);
      const formatConcat = format?.concatTokens();
      for (const formatSource of format?.findAllExpressions(Expressions.Source) || []) {
        new Source().runSyntax(formatSource, input);
      }

      if (format
          && formatConcat?.includes("ALPHA = ")
          && !(type instanceof UnknownType)
          && !(type instanceof VoidType)
          && !(type instanceof StringType)
          && !(type instanceof CLikeType)
          && !(type instanceof CharacterType)
          && !(type instanceof NumericGenericType)
          && !(type instanceof NumericType)
          && !(type instanceof AnyType)) {
        const message = "Cannot apply ALPHA to this type";
        input.issues.push(syntaxIssue(input, format.getFirstToken(), message));
        return new VoidType(CheckSyntaxKey);
      }
    }

    return ret;
  }
}