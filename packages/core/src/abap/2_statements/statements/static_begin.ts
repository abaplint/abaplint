import {IStatement} from "./_statement";
import {seq, alt, opt} from "../combi";
import {Integer, DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class StaticBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq("OCCURS", Integer);

    const ret = seq(alt("STATIC", "STATICS"),
                    "BEGIN OF",
                    DefinitionName,
                    opt(occurs));

    return ret;
  }

}