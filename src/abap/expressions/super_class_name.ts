import {Expression, IRunnable} from "../combi";
import {ClassName} from "./class_name";

export class SuperClassName extends Expression {
  public getRunnable(): IRunnable {
    return new ClassName();
  }
}