import {INode} from "../../nodes/_inode";
import {IMatch} from "./_match";
import {StatementNode} from "../../nodes/statement_node";

export interface IStructureRunnable {
  toRailroad(): string;
  getUsing(): string[];
  run(statements: StatementNode[], parent: INode): IMatch;
  // returns first token in upper case, if not applicable then the empty string
  first(): string[];
}