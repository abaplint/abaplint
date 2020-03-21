import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Field} from "../expressions";

export class TestSeam implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("TEST-SEAM"), new Field());
  }

}