import {Statement} from "./_statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Field} from "../expressions";

export class InterfaceDeferred extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("INTERFACE"),
               new Field(),
               str("DEFERRED"),
               opt(str("PUBLIC")));
  }

}