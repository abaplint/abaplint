import {INode} from "../../nodes/_inode";
import {InstanceArrow} from "../../1_lexer/tokens";
import {Dereference, TableExpression} from "../../2_statements/expressions";
import {ReferenceType} from "../_reference";

export function targetReference(children: readonly INode[], start: number): ReferenceType {
  for (let i = start; i < children.length; i++) {
    const get = children[i].get();
    // A table expression in a write position requires a writable table, even before a dereference.
    if (get instanceof TableExpression) {
      return ReferenceType.DataWriteReference;
    } else if (get instanceof InstanceArrow || get instanceof Dereference) {
      return ReferenceType.DataReadReference;
    }
  }
  return ReferenceType.DataWriteReference;
}
