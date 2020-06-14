import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Case implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CASE"), new Source());
  }

}