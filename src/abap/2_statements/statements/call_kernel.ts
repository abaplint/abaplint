import {IStatement} from "./_statement";
import {verNot, str, seq, alt, star} from "../combi";
import {Source, Constant, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallKernel implements IStatement {

  public getMatcher(): IStatementRunnable {

    const field = seq(str("ID"),
                      new Source(),
                      str("FIELD"),
                      new Source());

    const ret = seq(str("CALL"),
                    alt(new Constant(), new Field()),
                    star(field));

    return verNot(Version.Cloud, ret);
  }

}