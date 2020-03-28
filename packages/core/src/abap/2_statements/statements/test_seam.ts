import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TestSeam implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("TEST-SEAM"), new Field());
  }

}