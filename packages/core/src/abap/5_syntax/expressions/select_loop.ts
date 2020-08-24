import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Select} from "./select";

export class SelectLoop {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): void {
    // try using the other Select, they should look very much the same
    new Select().runSyntax(node, scope, filename);
  }
}