import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Source, Field} from "../expressions";

export class FunctionPool extends Statement {

  public get_matcher(): IRunnable {
    return seq(str("FUNCTION-POOL"),
               new Field(),
               opt(seq(str("MESSAGE-ID"), new Source())));
  }

}