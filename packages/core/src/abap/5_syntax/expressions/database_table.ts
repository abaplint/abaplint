import {ExpressionNode} from "../../nodes";
import {UnknownType} from "../../types/basic/unknown_type";
import {CurrentScope} from "../_current_scope";

export class DatabaseTable {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, _filename: string): void {

    const name = node.getFirstToken().getStr();

    const found = scope.getDDIC().lookupTableOrView(name);
    if (found instanceof UnknownType) {
      throw new Error("Database table or view \"" + name + "\" not found");
    }

  }
}