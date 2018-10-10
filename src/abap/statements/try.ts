import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class Try extends Statement {

  public static get_matcher(): IRunnable {
    return str("TRY");
  }

}