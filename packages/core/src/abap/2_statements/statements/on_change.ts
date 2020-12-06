import {IStatement} from "./_statement";
import {verNot, seqs, star} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class OnChange implements IStatement {

  public getMatcher(): IStatementRunnable {
    const or = seqs("OR", Target);

    const ret = seqs("ON CHANGE OF", Target, star(or));

    return verNot(Version.Cloud, ret);
  }

}