import {IStatement} from "./_statement";
import {seq, opt, altPrio} from "../combi";
import {Integer, DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DataBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq("OCCURS", Integer);

    const common = altPrio(seq("COMMON PART", DefinitionName), "COMMON PART");

    const structure = seq("BEGIN OF",
                          altPrio(common, seq(
                            DefinitionName,
                            opt("READ-ONLY"),
                            opt(occurs))));

    return seq("DATA", structure);
  }

}