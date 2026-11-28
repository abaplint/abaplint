import * as Expressions from "../2_statements/expressions";
import {ExpressionNode} from "../nodes";
import {InstanceArrow} from "../1_lexer/tokens";
import {CharacterType, Integer8Type, IntegerType, NumericType, PackedType, StringType, StructureType} from "../types/basic";
import {AbstractType} from "../types/basic/_abstract_type";
import {ClassAttribute} from "../types/class_attribute";
import {IdentifierMeta, TypedIdentifier} from "../types/_typed_identifier";
import {ObjectOriented} from "./_object_oriented";
import {SyntaxInput} from "./_syntax_input";

/** The constant a "SimpleFieldChain2" starts with, undefined for a variable.
 * An attribute behind "->" is not resolved here */
export function findConstant(field: ExpressionNode, input: SyntaxInput): TypedIdentifier | undefined {
  const children = field.getChildren();
  if (children.some(c => c.get() instanceof InstanceArrow)) {
    return undefined;
  }

  if (children[0].get() instanceof Expressions.ClassName) {
    const def = input.scope.findObjectDefinition(children[0].concatTokens());
    return new ObjectOriented(input.scope).searchConstantName(def, children[2]?.concatTokens());
  }

  const found = input.scope.findVariable(children[0].concatTokens());
  if (found === undefined || found instanceof ClassAttribute) {
    return undefined;
  }
  const meta = found.getMeta();
  return meta.includes(IdentifierMeta.ReadOnly) && meta.includes(IdentifierMeta.Static) ? found : undefined;
}

/** The number a constant, or a component of a structured one, stands for. Undefined for a variable,
 * and if the value is not known or not a whole number without sign */
export function constantNumber(field: ExpressionNode, input: SyntaxInput): number | undefined {
  const constant = findConstant(field, input);
  if (constant === undefined) {
    return undefined;
  }

  let type: AbstractType | undefined = constant.getType();
  let value = constant.getValue();
  const children = field.getChildren();
  // a class name is followed by "=>" and the attribute name
  const first = children[0].get() instanceof Expressions.ClassName ? 3 : 1;
  for (const child of children.slice(first)) {
    if (child.get() instanceof Expressions.ComponentName) {
      const name = child.concatTokens().toUpperCase();
      if (!(type instanceof StructureType) || typeof value !== "object") {
        return undefined;
      }
      type = type.getComponentByName(name);
      value = Object.entries(value).find(([key]) => key.toUpperCase() === name)?.[1];
    }
  }

  if (typeof value !== "string") {
    return undefined;
  }
  const digits = value.match(/^(['`]?)(\d+)\1$/)?.[2];
  if (digits === undefined) {
    return undefined;
  } else if (type instanceof CharacterType || type instanceof NumericType) {
    // a longer value does not fit the constant
    return digits.length <= type.getLength() ? Number(digits) : undefined;
  } else if (type instanceof IntegerType || type instanceof Integer8Type || type instanceof StringType
      || (type instanceof PackedType && type.getDecimals() === 0)) {
    return Number(digits);
  }
  // eg. the digits of a byte-like constant are hexadecimal
  return undefined;
}
