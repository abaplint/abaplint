import {IStatement} from "./_statement";
import {verNot, seq, opts, pluss} from "../combi";
import {Target, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Demand implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seq(Field, "=", Target);

    const messages = seq("MESSAGES INTO", Target);

    const ret = seq("DEMAND",
                    pluss(field),
                    "FROM CONTEXT",
                    Field,
                    opts(messages));

    return verNot(Version.Cloud, ret);
  }

}