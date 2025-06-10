import {ExpressionNode} from "../../nodes";
import {SyntaxInput} from "../_syntax_input";
import {Select} from "./select";

export class SelectLoop {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): void {
    // try using the other Select, they should look very much the same
    Select.runSyntax(node, input);
  }
}