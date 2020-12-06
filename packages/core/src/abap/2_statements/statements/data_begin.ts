import {IStatement} from "./_statement";
import {seq, opt} from "../combi";
import {Integer, DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DataBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq("OCCURS", Integer);

    const structure = seq("BEGIN OF",
                          opt("COMMON PART"),
                          DefinitionName,
                          opt("READ-ONLY"),
                          opt(occurs));

    return seq("DATA", structure);
  }

}