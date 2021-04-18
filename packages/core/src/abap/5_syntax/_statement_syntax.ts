import {StatementNode} from "../nodes/statement_node";
import {CurrentScope} from "./_current_scope";

export interface StatementSyntax {
  runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void;
}