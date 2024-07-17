import {ExpressionNode} from "../../nodes";
import {SyntaxInput} from "../_syntax_input";
import {Select} from "./select";

export class SelectLoop {
  public runSyntax(node: ExpressionNode, input: SyntaxInput): void {
    // try using the other Select, they should look very much the same
    new Select().runSyntax(node, input);
  }
}