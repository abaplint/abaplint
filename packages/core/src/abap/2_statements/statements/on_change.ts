import {IStatement} from "./_statement";
import {verNot, seq, stars} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class OnChange implements IStatement {

  public getMatcher(): IStatementRunnable {
    const or = seq("OR", Target);

    const ret = seq("ON CHANGE OF", Target, stars(or));

    return verNot(Version.Cloud, ret);
  }

}