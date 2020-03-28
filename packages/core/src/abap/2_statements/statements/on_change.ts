import {IStatement} from "./_statement";
import {verNot, str, seq, star} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class OnChange implements IStatement {

  public getMatcher(): IStatementRunnable {
    const or = seq(str("OR"), new Target());

    const ret = seq(str("ON CHANGE OF"), new Target(), star(or));

    return verNot(Version.Cloud, ret);
  }

}