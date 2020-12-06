import {IStatement} from "./_statement";
import {seq, opt} from "../combi";
import {Integer, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDataBegin implements IStatement {

  public getMatcher(): IStatementRunnable {

    const occurs = seq("OCCURS", Integer);

    const structure = seq("BEGIN OF",
                          opt("COMMON PART"),
                          NamespaceSimpleName,
                          opt("READ-ONLY"),
                          opt(occurs));

    return seq("CLASS-DATA", structure);
  }

}