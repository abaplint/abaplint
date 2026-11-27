import * as Expressions from "../2_statements/expressions";
import {ExpressionNode} from "../nodes";
import {INode} from "../nodes/_inode";
import {CharacterType, DataReference, DateType, DecFloat16Type, DecFloat34Type, FloatingPointType, FloatType,
  GenericObjectReferenceType, Integer8Type, IntegerType, NumericType, ObjectReferenceType, StringType, StructureType,
  TableType, TimeType, UTCLongType, VoidType, XStringType} from "../types/basic";
import {AbstractType} from "../types/basic/_abstract_type";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "./_syntax_input";

/** The length of the character-like initial part of a flat structure which also has other components:
 * the fields of type c, n, d and t in front of the first other one. A single field of type c, and an
 * offset or length, can access this part. Returns undefined for a purely character-like structure,
 * for a deep one and for one with void or unknown components */
export function characterStartLength(structure: StructureType): number | undefined {
  if (structure.containsVoid() || isDeep(structure)) {
    return undefined;
  }
  const start = initialPart(structure);
  return start.complete ? undefined : start.length;
}

/** true for a structure with a character-like initial part, see characterStartLength */
export function hasCharacterStart(type: AbstractType | undefined): boolean {
  return type instanceof StructureType && (characterStartLength(type) ?? 0) > 0;
}

/** The type of an offset or length on a structure with a character-like initial part: a character
 * field inside that part, a static offset or length which leaves it is a syntax error. Returns
 * undefined for every other type, and for the length "*" and 0. The offset and the length are checked
 * in separate calls, "node" is the one of the call and "chain" holds the nodes around both of them */
export function characterStartSubstring(
  context: AbstractType | undefined,
  offset: number | undefined,
  length: number | undefined,
  node: INode,
  chain: readonly INode[],
  input: SyntaxInput): AbstractType | undefined {

  const start = context instanceof StructureType ? characterStartLength(context) : undefined;
  if (start === undefined || start === 0
      || length === 0 || (node instanceof ExpressionNode && node.concatTokens() === "(*)")) {
    return undefined;
  }

  const error = (what: string) => {
    const message = `${what} exceeds the character-like initial part of length ${start} of the structure`;
    input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    return VoidType.get(CheckSyntaxKey);
  };

  if (node.get() instanceof Expressions.FieldOffset) {
    const lengthNode = chain.find(c => c.get() instanceof Expressions.FieldLength);
    if (offset === undefined) {
      // the offset is a variable, a static length still has to fit
      const staticLength = lengthNode instanceof ExpressionNode ? lengthNode.concatTokens().match(/^\((\d+)\)$/) : null;
      if (staticLength && Number(staticLength[1]) > start) {
        return error("Length " + staticLength[1]);
      }
      return new CharacterType(start);
    } else if (offset >= start || (offset > 0 && lengthNode === undefined)) {
      // without a length, a static offset takes the length of the whole structure
      return error("Offset " + offset);
    }
    // the length is then checked against the rest of the initial part
    return new CharacterType(start - offset);
  }

  // a length without offset, after an offset the context is not the structure any more
  if (length === undefined) {
    return new CharacterType(start);
  }
  return length <= start ? new CharacterType(length) : error("Length " + length);
}

function initialPart(structure: StructureType): {length: number, complete: boolean} {
  let length = 0;
  for (const component of structure.getComponents()) {
    const type = component.type;
    if (type instanceof CharacterType || type instanceof NumericType) {
      length += type.getLength();
    } else if (type instanceof DateType) {
      length += 8;
    } else if (type instanceof TimeType) {
      length += 6;
    } else if (type instanceof StructureType && (length * 2) % alignment(type) === 0) {
      // otherwise there is a gap in front of the substructure, which ends the initial part
      const sub = initialPart(type);
      length += sub.length;
      if (sub.complete === false) {
        return {length, complete: false};
      }
    } else {
      return {length, complete: false};
    }
  }
  return {length, complete: true};
}

function alignment(type: AbstractType): number {
  if (type instanceof StructureType) {
    return Math.max(1, ...type.getComponents().map(c => alignment(c.type)));
  } else if (type instanceof CharacterType || type instanceof NumericType
      || type instanceof DateType || type instanceof TimeType) {
    return 2;
  } else if (type instanceof IntegerType) {
    return 4;
  } else if (type instanceof Integer8Type || type instanceof FloatType || type instanceof FloatingPointType
      || type instanceof DecFloat16Type || type instanceof UTCLongType) {
    return 8;
  } else if (type instanceof DecFloat34Type) {
    return 16;
  }
  return 1;
}

function isDeep(type: AbstractType): boolean {
  if (type instanceof StructureType) {
    return type.getComponents().some(c => isDeep(c.type));
  }
  return type instanceof StringType
    || type instanceof XStringType
    || type instanceof TableType
    || type instanceof DataReference
    || type instanceof ObjectReferenceType
    || type instanceof GenericObjectReferenceType;
}
