import {IStatement} from "./_statement";
import {seq, opt} from "../combi";
import {IncludeName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Include implements IStatement {
  public getMatcher(): IStatementRunnable {
    const ret = seq("INCLUDE", IncludeName, opt("IF FOUND"));

    return ret;
  }
}