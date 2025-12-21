import {IStatement} from "./_statement";
import {seq, altPrio, optPrio} from "../combi";
import {Integer, DefinitionName, FieldChain} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DataBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq("OCCURS", altPrio(Integer, FieldChain));

    const common = seq("COMMON PART", optPrio(DefinitionName));

    const structure = seq("BEGIN OF",
                          altPrio(common, seq(
                            DefinitionName,
                            optPrio("READ-ONLY"),
                            optPrio(occurs))));

    return seq("DATA", structure);
  }

}