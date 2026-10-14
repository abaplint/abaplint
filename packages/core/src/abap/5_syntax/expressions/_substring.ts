import {INode} from "../../nodes/_inode";
import * as Expressions from "../../2_statements/expressions";
import {CharacterType, DateType, HexType, NumericType, TimeType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

// The type of a substring with a static offset or length, used for reading and writing positions.
// On a character or byte field of fixed length the substring must lie inside the field, else it is
// a syntax error. Other types, a dynamic offset or length and "*" (undefined) are left alone, as is
// length 0. The offset is applied first, so the length is compared to what remains after the offset.
// A substring of a date, time or numeric text field has type n; its bounds are not checked.
export function substringType(
  context: AbstractType | undefined,
  offset: number | undefined,
  length: number | undefined,
  node: INode,
  input: SyntaxInput): AbstractType | undefined {

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
