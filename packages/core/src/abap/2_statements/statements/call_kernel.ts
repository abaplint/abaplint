import {IStatement} from "./_statement";
import {verNot, seqs, alt, star} from "../combi";
import {Source, Constant, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallKernel implements IStatement {

  public getMatcher(): IStatementRunnable {

    const field = seqs("ID",
                       Source,
                       "FIELD",
                       Source);

    const ret = seqs("CALL",
                     alt(new Constant(), new Field()),
                     star(field));

    return verNot(Version.Cloud, ret);
  }

}