import {Visibility} from "./visibility";
import {StatementNode} from "../nodes";
import {Constant} from "./constant";

export class ClassConstant extends Constant {
  private readonly visibility: Visibility;

  constructor(node: StatementNode, visibility: Visibility, filename: string) {
    super(node, filename);
    this.visibility = visibility;
  }

  public getVisibility() {
    return this.visibility;
  }

}