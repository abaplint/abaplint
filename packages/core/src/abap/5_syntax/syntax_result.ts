import {Issue} from "../../issue";
import {ISpaghettiScope} from "./_spaghetti_scope";

export interface ISyntaxResult {
  readonly issues: Issue[];
  readonly spaghetti: ISpaghettiScope;
}