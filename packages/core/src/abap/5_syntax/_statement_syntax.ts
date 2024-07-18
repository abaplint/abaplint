import {StatementNode} from "../nodes/statement_node";
import {SyntaxInput} from "./_syntax_input";

export interface StatementSyntax {
  runSyntax(node: StatementNode, input: SyntaxInput): void;
}