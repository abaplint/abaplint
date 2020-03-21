import {IStatement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {Target} from "../expressions";

export class Cleanup implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seq(str("INTO"), new Target());

    return seq(str("CLEANUP"), opt(into));
  }

}