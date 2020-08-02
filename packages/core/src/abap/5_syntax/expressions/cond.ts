import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";

export class Cond {
  public runSyntax(_node: ExpressionNode | undefined, _scope: CurrentScope): void {
    return;
  }
}