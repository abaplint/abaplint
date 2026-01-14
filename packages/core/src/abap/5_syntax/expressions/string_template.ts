import {ExpressionNode, TokenNode} from "../../nodes";
import {AnyType, CLikeType, CharacterType, NumericGenericType, NumericType, StringType, StructureType, UTCLongType, UnknownType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {TypeUtils} from "../_type_utils";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import * as Tokens from "../../1_lexer/tokens";

export class StringTemplate {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): AbstractType {
    const typeUtils = new TypeUtils(input.scope);
    const ret = StringType.get();

    for (const child of node.getChildren()) {
      if (child instanceof ExpressionNode && child.get() instanceof Expressions.StringTemplateSource) {
        const s = child.findDirectExpression(Expressions.Source);
        const type = Source.runSyntax(s, input, ret);
        if (type === undefined) {
          const message = "No target type determined";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        } else if ((typeUtils.isCharLike(type) === false
          && typeUtils.isHexLike(type) === false
          && !(type instanceof UTCLongType))
          || type instanceof StructureType) {
          const message = "String template, not character like, " + type.constructor.name;
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        }

        const format = child.findDirectExpression(Expressions.StringTemplateFormatting);
        const formatConcat = format?.concatTokens();
        for (const formatSource of format?.findAllExpressions(Expressions.Source) || []) {
          Source.runSyntax(formatSource, input);
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
          const message = `Cannot apply ALPHA to this type (${type.constructor.name})`;
          input.issues.push(syntaxIssue(input, format.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        }
      } else if (child instanceof TokenNode) {
        const token = child.get();
        if (token instanceof Tokens.StringTemplate
          || token instanceof Tokens.StringTemplateBegin
          || token instanceof Tokens.StringTemplateMiddle
          || token instanceof Tokens.StringTemplateEnd) {
          const issue = this.validateEscapeSequences(token.getStr(), input, child);
          if (issue) {
            input.issues.push(issue);
            return VoidType.get(CheckSyntaxKey);
          }
        }
      }
    }

    return ret;
  }

  private static validateEscapeSequences(str: string, input: SyntaxInput, node: TokenNode) {
    // Valid escape sequences in ABAP string templates: \|, \{, \}, \\, \n, \r, \t
    const validEscapes = new Set(["\\|", "\\{", "\\}", "\\\\", "\\n", "\\r", "\\t"]);

    for (let i = 0; i < str.length; i++) {
      if (str[i] === "\\") {
        const escape = str.substring(i, i + 2);
        if (!validEscapes.has(escape)) {
          return syntaxIssue(input, node.getFirstToken(), `Invalid escape sequence "${escape}" in string template`);
        }
        i++; // skip the next character as it's part of the escape sequence
      }
    }
    return undefined;
  }
}