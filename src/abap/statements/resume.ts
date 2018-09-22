import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class Resume extends Statement {

  public static get_matcher(): IRunnable {
    return str("RESUME");
  }

}