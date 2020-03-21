import {Issue} from "../../issue";
import {StructureNode} from "../nodes";

export interface IStructureResult {
  readonly issues: Issue[];
  readonly node?: StructureNode;
}