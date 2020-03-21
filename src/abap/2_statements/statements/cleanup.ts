import {IStatement} from "./_statement";
import {str, seq, opt} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Cleanup implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seq(str("INTO"), new Target());

    return seq(str("CLEANUP"), opt(into));
  }

}