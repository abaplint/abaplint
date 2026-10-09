import {INode} from "../../nodes/_inode";
import {IMatch, IMatchAt} from "./_match";
import {StatementNode} from "../../nodes/statement_node";

export interface IStructureRunnable {
  toRailroad(): string;
  getUsing(): string[];
  run(statements: StatementNode[], parent: INode): IMatch;
  // matches from statements[index] without copying the statements after it
  runAt(statements: StatementNode[], index: number, parent: INode): IMatchAt;
  // returns first token in upper case, if not applicable then the empty string
  first(): string[];
}