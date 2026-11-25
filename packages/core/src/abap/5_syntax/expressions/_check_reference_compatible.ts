import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {IMethodDefinition} from "../../types/_method_definition";
import {IdentifierMeta, TypedIdentifier} from "../../types/_typed_identifier";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {BuiltInMethod} from "../_builtin";
import {TypeUtils} from "../_type_utils";

// A data object passed to an IMPORTING parameter by reference, with a complete elementary type,
// must be compatible with it, there is no conversion. An expression, a functional call or a literal
// is passed as a temporary of the type of the parameter, a parameter passed by value converts.
// Returns true if an issue was reported.
export function checkReferenceCompatible(
  source: ExpressionNode,
  sourceType: AbstractType | undefined,
  parameter: TypedIdentifier | undefined,
  method: IMethodDefinition | VoidType,
  input: SyntaxInput): boolean {

  if (parameter === undefined
      || method instanceof VoidType
      || method instanceof BuiltInMethod
      || parameter.getMeta().includes(IdentifierMeta.PassByValue)
      || isDataObject(source, input) === false) {
    return false;
  }

  const targetType = parameter.getType();
  if (new TypeUtils(input.scope).isReferenceCompatibleElementary(sourceType, targetType) === true) {
    return false;
  }

  const message = `The type "${sourceType?.toABAP()}" of "${source.concatTokens()}" is not compatible with the type "${
    targetType.toABAP()}" of "${parameter.getName()}", passed by reference`;
  input.issues.push(syntaxIssue(input, source.getFirstToken(), message));
  return true;
}

// a variable, a constant, an attribute, a component or a field symbol, without offset, length, table
// expression, method call or dynamic component; an inline declared variable is left out, its type is inferred
function isDataObject(source: ExpressionNode, input: SyntaxInput): boolean {
  if (!(source.get() instanceof Expressions.Source) || source.getChildren().length !== 1) {
    return false;
  }
  const chain = source.getFirstChild();
  if (!(chain instanceof ExpressionNode) || !(chain.get() instanceof Expressions.FieldChain)) {
    return false;
  }
  if (chain.findFirstExpression(Expressions.TableExpression) !== undefined
      || chain.findFirstExpression(Expressions.TableBody) !== undefined
      || chain.findFirstExpression(Expressions.FieldOffset) !== undefined
      || chain.findFirstExpression(Expressions.FieldLength) !== undefined
      || chain.findFirstExpression(Expressions.MethodCall) !== undefined
      || chain.concatTokens().includes("(")) {
    return false;
  }

  const children = chain.getChildren();
  if (children.length === 1) {
    const name = children[0].concatTokens();
    const found = input.scope.findVariable(name);
    if (found === undefined || found.getMeta().includes(IdentifierMeta.InlineDefinition)) {
      return false;
    }
  }
  return true;
}
