import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Cond} from "../expressions";

export class If extends Statement {

  public get_matcher(): IRunnable {
    return seq(str("IF"), new Cond());
  }

}