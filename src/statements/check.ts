import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Cond} from "../expressions";

export class Check extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("CHECK"), new Cond());
  }

}