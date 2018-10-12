import {Statement} from "./statement";
import {str, opt, seq, plus, IRunnable} from "../combi";
import {Target, Field} from "../expressions";

export class Catch extends Statement {

  public get_matcher(): IRunnable {
    return seq(str("CATCH"),
               plus(new Field()),
               opt(seq(str("INTO"), new Target())));
  }

}