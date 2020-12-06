import {IStatement} from "./_statement";
import {verNot, seqs, opts, pluss} from "../combi";
import {Target, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Demand implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seqs(Field, "=", Target);

    const messages = seqs("MESSAGES INTO", Target);

    const ret = seqs("DEMAND",
                     pluss(field),
                     "FROM CONTEXT",
                     Field,
                     opts(messages));

    return verNot(Version.Cloud, ret);
  }

}