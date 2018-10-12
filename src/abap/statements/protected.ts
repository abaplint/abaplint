import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class Protected extends Statement {

  public get_matcher(): IRunnable {
    return str("PROTECTED SECTION");
  }

}