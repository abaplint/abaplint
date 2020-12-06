import {IStatement} from "./_statement";
import {seq} from "../combi";
import {Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TestInjection implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("TEST-INJECTION", Field);
  }

}