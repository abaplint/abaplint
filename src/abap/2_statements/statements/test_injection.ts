import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Field} from "../expressions";

export class TestInjection implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("TEST-INJECTION"), new Field());
  }

}