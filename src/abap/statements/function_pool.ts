import {Statement} from "./_statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Source, Field} from "../expressions";

export class FunctionPool extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("FUNCTION-POOL"),
               new Field(),
               opt(seq(str("MESSAGE-ID"), new Source())));
  }

}