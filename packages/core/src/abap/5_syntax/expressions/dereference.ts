import {INode} from "../../nodes/_inode";
import {AnyType, DataReference, DataType, UnknownType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Dereference {
  public runSyntax(node: INode, type: AbstractType | undefined, input: SyntaxInput): AbstractType | undefined {
    if (type instanceof VoidType
        || type instanceof AnyType
        || type instanceof DataType
        || type === undefined
        || type instanceof UnknownType) {
      return type;
    }

    if (!(type instanceof DataReference)) {
      const message = "Not a data reference, cannot be dereferenced";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return VoidType.get(CheckSyntaxKey);
    }

    return type.getType();
  }
}