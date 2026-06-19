import {altPrio, seq, Expression, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLAssociationsList} from "./sql_associations_list";
import {Dynamic} from "./dynamic";
import {Version} from "../../../version";

export class SQLCTEAssociations extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Version.v751, seq("ASSOCIATIONS", altPrio(new SQLAssociationsList(), Dynamic)));
  }
}
