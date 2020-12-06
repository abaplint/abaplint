import {IStatement} from "./_statement";
import {seq, opts} from "../combi";
import {Integer, DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DataBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq("OCCURS", Integer);

    const structure = seq("BEGIN OF",
                          opts("COMMON PART"),
                          DefinitionName,
                          opts("READ-ONLY"),
                          opts(occurs));

    return seq("DATA", structure);
  }

}