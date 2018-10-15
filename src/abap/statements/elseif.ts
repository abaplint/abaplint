import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Cond} from "../expressions";

export class ElseIf extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("ELSEIF"), new Cond());
  }

}