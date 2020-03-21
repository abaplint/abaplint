import {StatementNode} from "../../nodes";
import {INode} from "../../nodes/_inode";
import {IMatch} from "./_match";

export interface IStructureRunnable {
  toRailroad(): string;
  getUsing(): string[];
  run(statements: StatementNode[], parent: INode): IMatch;
}