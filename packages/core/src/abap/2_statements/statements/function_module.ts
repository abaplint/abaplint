import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionModule implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("FUNCTION"), new Field());
  }

}