import {Statement} from "./_statement";
import {str, opt, seq, plus, IStatementRunnable} from "../combi";
import {Target, Field} from "../expressions";

export class Catch extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CATCH"),
               plus(new Field()),
               opt(seq(str("INTO"), new Target())));
  }

}