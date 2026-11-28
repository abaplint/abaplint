import {ExpressionNode} from "../../nodes";
import {INode} from "../../nodes/_inode";
import * as Expressions from "../../2_statements/expressions";
import {CGenericType, CharacterType, CLikeType, CSequenceType, DateType, DecFloat16Type, DecFloat34Type, DecFloatType,
  FloatingPointType, FloatType, HexType, Integer8Type, IntegerType, NumericType, PackedType, SimpleType, StructureType,
  TimeType, UTCLongType, VoidType, XGenericType, XSequenceType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {characterStartSubstring, hasCharacterStart} from "../_character_start";
import {findConstant} from "../_constant_operand";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

// The type of a substring with a static offset or length, used for reading and writing positions.
// On a character or byte field of fixed length the substring must lie inside the field, else it is
// a syntax error, unless the offset or length is a variable: then the bounds are left to the runtime.
// Other types, a dynamic offset or length and "*" (undefined) are left alone.
// A static length of 0 is a syntax error on a field of fixed length, also on a generically typed one,
// while a string, an xstring and the types "any" and "data" take it. See also allowEmptySubstring.
// The offset is applied first, so the length is compared to what remains after the offset.
// "chain" holds the nodes of the surrounding chain, including both the offset and the length.
// A substring of a date, time or numeric text field has type n; its bounds are not checked.
// An offset or length on a numeric field (i, int8, p, f, decfloat) is a syntax error, unless the access
// takes the whole field: the offset 0, the length "*" and the length of the field in bytes are accepted.
// A time stamp of type utclong has no substrings either, only the offset 0 and the length "*", which
// take the whole field, are accepted.
export function substringType(
  context: AbstractType | undefined,
  offset: number | undefined,
  length: number | undefined,
  node: INode,
  chain: readonly INode[],
  input: SyntaxInput): AbstractType | undefined {
  const characterStart = characterStartSubstring(context, offset, length, node, chain, input);
  if (characterStart !== undefined) {
    return characterStart;
  }

  const numericName = numericTypeName(context);
  if (numericName !== undefined) {
    // the offset and the length are checked in separate calls, so each has to take the whole field
    if (offset === 0 || isFullLength(node) || (length !== undefined && length === numericByteLength(context))) {
      return context;
    }
    const message = `Field type "${numericName}" does not permit substrings to be accessed`;
    input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    return VoidType.get(CheckSyntaxKey);
  }

  if (context instanceof UTCLongType) {
    if (offset === 0 || isFullLength(node)) {
      return context;
    }
    const message = `Field type "utclong" does not permit substrings to be accessed`;
    input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    return VoidType.get(CheckSyntaxKey);
  }

  if (length === 0 && input.emptySubstring !== node && excludesEmptySubstring(context)) {
    const message = "Substring length must be greater than 0";
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

// The source of ASSIGN and the target of WRITE TO can have a substring length of 0. Returns the input
// to check such an operand with, an operand nested in it, eg. a method argument, is checked as usual
export function allowEmptySubstring(input: SyntaxInput, operand: ExpressionNode): SyntaxInput {
  const chain = operand.get() instanceof Expressions.Target ? operand
    : operand.findDirectExpression(Expressions.FieldChain) || operand.findDirectExpression(Expressions.AttributeChain);
  return {...input, emptySubstring: chain?.findDirectExpression(Expressions.FieldLength)};
}

function excludesEmptySubstring(context: AbstractType | undefined): boolean {
  return context instanceof CharacterType || context instanceof NumericType
    || context instanceof DateType || context instanceof TimeType || context instanceof HexType
    || context instanceof StructureType || context instanceof CGenericType || context instanceof XGenericType
    || context instanceof CLikeType || context instanceof CSequenceType || context instanceof XSequenceType
    || context instanceof SimpleType;
}

// true if the offset or the length is given by a variable, a constant counts as static
function hasVariablePart(chain: readonly INode[], input: SyntaxInput): boolean {
  return chain.some(node => {
    if (!(node instanceof ExpressionNode)
        || !(node.get() instanceof Expressions.FieldOffset || node.get() instanceof Expressions.FieldLength)) {
      return false;
    }
    const field = node.findDirectExpression(Expressions.SimpleFieldChain2);
    return field !== undefined && findConstant(field, input) === undefined;
  });
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

// true for the length "*", a variable length is also undefined as a number
function isFullLength(node: INode): boolean {
  return node instanceof ExpressionNode && node.concatTokens() === "(*)";
}

// undefined if not known, eg. for the generic type decfloat
function numericByteLength(context: AbstractType | undefined): number | undefined {
  if (context instanceof IntegerType) {
    return 4;
  } else if (context instanceof PackedType) {
    return context.getLength();
  } else if (context instanceof FloatingPointType) {
    // dictionary types, a decfloat34 one has the length 34, "FLTP" and decfloat16 have 16
    return context.getLength() === 34 ? 16 : 8;
  } else if (context instanceof Integer8Type || context instanceof FloatType || context instanceof DecFloat16Type) {
    return 8;
  } else if (context instanceof DecFloat34Type) {
    return 16;
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
// bounds of the offset or length at "index" are not checked when it directly follows the field symbol.
// No generic type is represented by utclong, so such a field symbol is checked
export function isFieldSymbolItself(context: AbstractType | undefined, children: readonly INode[], index: number): boolean {
  if (context instanceof UTCLongType || hasCharacterStart(context)) {
    return false;
  }
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
