import {ExpressionNode} from "../../nodes";
import {INode} from "../../nodes/_inode";
import {InstanceArrow} from "../../1_lexer/tokens";
import * as Expressions from "../../2_statements/expressions";
import {CharacterType, DateType, DecFloat16Type, DecFloat34Type, DecFloatType, FloatingPointType, FloatType, HexType,
  Integer8Type, IntegerType, NumericType, PackedType, TimeType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ClassAttribute} from "../../types/class_attribute";
import {IdentifierMeta} from "../../types/_typed_identifier";
import {ObjectOriented} from "../_object_oriented";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

// The type of a substring with a static offset or length, used for reading and writing positions.
// On a character or byte field of fixed length the substring must lie inside the field, else it is
// a syntax error, unless the offset or length is a variable: then the bounds are left to the runtime.
// Other types, a dynamic offset or length and "*" (undefined) are left alone, as is length 0.
// The offset is applied first, so the length is compared to what remains after the offset.
// "chain" holds the nodes of the surrounding chain, including both the offset and the length.
// A substring of a date, time or numeric text field has type n; its bounds are not checked.
// An offset or length on a numeric field (i, int8, p, f, decfloat) is a syntax error, whatever its value,
// except a length without offset covering the full packed field, eg. "lv_p(5)" for "lv_p(5) TYPE p".
export function substringType(
  context: AbstractType | undefined,
  offset: number | undefined,
  length: number | undefined,
  node: INode,
  chain: readonly INode[],
  input: SyntaxInput): AbstractType | undefined {

  const numericName = numericTypeName(context);
  if (context instanceof PackedType && offset === undefined && length === context.getLength()) {
    // the offset is checked in a separate call before the length, so this is a length without offset
    return context;
  } else if (numericName !== undefined) {
    const message = `Field type "${numericName}" does not permit substrings to be accessed`;
    input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    return VoidType.get(CheckSyntaxKey);
  }

  if (context instanceof DateType || context instanceof TimeType || context instanceof NumericType) {
    return numericSubstringType(context, offset, length);
  }

  if (!(context instanceof CharacterType) && !(context instanceof HexType)) {
    return context;
  }
  const fieldLength = context.getLength();

  if (offset !== undefined && offset > 0) {
    if (offset >= fieldLength) {
      if (hasVariablePart(chain, input)) {
        return context;
      }
      const message = `Offset ${offset} is outside the field of length ${fieldLength}`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return VoidType.get(CheckSyntaxKey);
    }
    return context instanceof CharacterType ? new CharacterType(fieldLength - offset) : new HexType(fieldLength - offset);
  }

  if (length !== undefined && length > 0) {
    if (length > fieldLength) {
      if (hasVariablePart(chain, input)) {
        return context;
      }
      const message = `Length ${length} exceeds the remaining length ${fieldLength} of the field`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return VoidType.get(CheckSyntaxKey);
    }
    return context instanceof CharacterType ? new CharacterType(length) : new HexType(length);
  }

  return context;
}

// true if the offset or the length is given by a variable, a constant counts as static
function hasVariablePart(chain: readonly INode[], input: SyntaxInput): boolean {
  return chain.some(node => {
    if (!(node instanceof ExpressionNode)
        || !(node.get() instanceof Expressions.FieldOffset || node.get() instanceof Expressions.FieldLength)) {
      return false;
    }
    const field = node.findDirectExpression(Expressions.SimpleFieldChain2);
    return field !== undefined && isConstant(field, input) === false;
  });
}

// a constant or a component of one, an attribute behind "->" is not resolved here
function isConstant(field: ExpressionNode, input: SyntaxInput): boolean {
  const children = field.getChildren();
  if (children.some(c => c.get() instanceof InstanceArrow)) {
    return false;
  }

  const name = children[0].getFirstToken().getStr();
  if (children[0].get() instanceof Expressions.ClassName) {
    const def = input.scope.findObjectDefinition(name);
    const attribute = children[2]?.getFirstToken().getStr();
    return new ObjectOriented(input.scope).searchConstantName(def, attribute) !== undefined;
  }

  const found = input.scope.findVariable(name);
  if (found === undefined || found instanceof ClassAttribute) {
    return false;
  }
  const meta = found.getMeta();
  return meta.includes(IdentifierMeta.ReadOnly) && meta.includes(IdentifierMeta.Static);
}

// the internal type code the ABAP syntax check names: I, 8, P, F, a (decfloat16), e (decfloat34)
function numericTypeName(context: AbstractType | undefined): string | undefined {
  if (context instanceof IntegerType) {
    return "I";
  } else if (context instanceof Integer8Type) {
    return "8";
  } else if (context instanceof PackedType) {
    return "P";
  } else if (context instanceof FloatType || context instanceof FloatingPointType) {
    return "F";
  } else if (context instanceof DecFloat16Type) {
    return "a";
  } else if (context instanceof DecFloat34Type) {
    return "e";
  } else if (context instanceof DecFloatType) {
    return "DECFLOAT";
  }
  return undefined;
}

function numericSubstringType(
  context: DateType | TimeType | NumericType,
  offset: number | undefined,
  length: number | undefined): AbstractType {

  const hasOffset = offset !== undefined && offset > 0;
  const hasLength = length !== undefined && length > 0;
  if (hasOffset === false && hasLength === false) {
    return context;
  }

  let remaining = context instanceof DateType ? 8 : context instanceof TimeType ? 6 : context.getLength();
  if (hasOffset) {
    remaining = remaining - offset!;
  }
  if (hasLength) {
    remaining = Math.min(remaining, length!);
  }
  if (remaining <= 0) {
    return context;
  }
  return new NumericType(remaining);
}

// A field symbol typed "c" or "x" is generic, but its type is represented with length 1, so the
// offset or length at "index" is not checked when it directly follows the field symbol
export function isFieldSymbolItself(children: readonly INode[], index: number): boolean {
  const first = children[0]?.get();
  if (!(first instanceof Expressions.SourceFieldSymbol) && !(first instanceof Expressions.TargetFieldSymbol)) {
    return false;
  }
  for (let i = 1; i < index; i++) {
    if (!(children[i].get() instanceof Expressions.FieldOffset)) {
      return false;
    }
  }
  return true;
}
