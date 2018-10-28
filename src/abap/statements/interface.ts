import {Statement} from "./statement";
import {str, seq, opt, per, IRunnable} from "../combi";
import {Field} from "../expressions";

export class Interface extends Statement {

  public getMatcher(): IRunnable {
    let options = per(str("PUBLIC"), str("DEFERRED"));

    return seq(str("INTERFACE"),
               new Field(),
               opt(options));
  }

}