import {INode} from "../../nodes/_inode";
import * as Expressions from "../../2_statements/expressions";
import {CharacterType, DateType, DecFloat16Type, DecFloat34Type, DecFloatType, FloatingPointType, FloatType, HexType,
  Integer8Type, IntegerType, NumericType, PackedType, TimeType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

// The type of a substring with a static offset or length, used for reading and writing positions.
// On a character or byte field of fixed length the substring must lie inside the field, else it is
// a syntax error. Other types, a dynamic offset or length and "*" (undefined) are left alone, as is
// length 0. The offset is applied first, so the length is compared to what remains after the offset.
// A substring of a date, time or numeric text field has type n; its bounds are not checked.
// An offset or length on a numeric field (i, int8, p, f, decfloat) is a syntax error, whatever its value,
// except a length without offset covering the full packed field, eg. "lv_p(5)" for "lv_p(5) TYPE p".
export function substringType(
  context: AbstractType | undefined,
  offset: number | undefined,
  length: number | undefined,
  node: INode,
  input: SyntaxInput): AbstractType | undefined {

  const numericName = numericTypeName(context);
  if (context instanceof PackedType && offset === undefined && length === context.getLength()) {
    // the offset is checked in a separate call before the length, so this is a length without offset
    return context;
  } else if (numericName !== undefined) {
    const message = `Offset or length specification not possible on a field of numeric type "${numericName}"`;
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
      const message = `Offset ${offset} is outside the field of length ${fieldLength}`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return VoidType.get(CheckSyntaxKey);
    }
    return context instanceof CharacterType ? new CharacterType(fieldLength - offset) : new HexType(fieldLength - offset);
  }

  if (length !== undefined && length > 0) {
    if (length > fieldLength) {
      const message = `Length ${length} exceeds the remaining length ${fieldLength} of the field`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return VoidType.get(CheckSyntaxKey);
    }
    return context instanceof CharacterType ? new CharacterType(length) : new HexType(length);
  }

  return context;
}

function numericTypeName(context: AbstractType | undefined): string | undefined {
  if (context instanceof IntegerType) {
    return "I";
  } else if (context instanceof Integer8Type) {
    return "INT8";
  } else if (context instanceof PackedType) {
    return "P";
  } else if (context instanceof FloatType || context instanceof FloatingPointType) {
    return "F";
  } else if (context instanceof DecFloat16Type) {
    return "DECFLOAT16";
  } else if (context instanceof DecFloat34Type) {
    return "DECFLOAT34";
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
