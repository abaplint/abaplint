import {alt, Reuse, IRunnable} from "../combi";
import {ConstantString, Integer} from "./";

export class Constant extends Reuse {
  public get_runnable(): IRunnable {
    return alt(new ConstantString(), new Integer());
  }
}