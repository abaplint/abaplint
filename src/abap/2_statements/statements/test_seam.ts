import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Field} from "../expressions";

export class TestSeam extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("TEST-SEAM"), new Field());
  }

}