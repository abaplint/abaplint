import {IStatement} from "./_statement";
import {optPrio, seq, verNot} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class TypeBegin implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seq("TYPES", "BEGIN OF", NamespaceSimpleName, optPrio(verNot(Version.Cloud, "%_FINAL")));

    return ret;
  }

}