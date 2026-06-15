import {seq, Expression, altPrio, optPrio, plusPrio, ver} from "../combi";
import {SQLIntoTable, SQLOrderBy, SQLIntoList, SQLSetOp} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLIntoStructure} from "./sql_into_structure";
import {buildSelectCore} from "./_select_core";

export class Select extends Expression {
  public getRunnable(): IStatementRunnable {
    const into = altPrio(SQLIntoTable, SQLIntoStructure, SQLIntoList);

    const standalone = buildSelectCore(into);

    const unionTail = ver(Version.v750, plusPrio(SQLSetOp), Version.OpenABAP);
    const chained = seq(buildSelectCore(undefined, false), unionTail, optPrio(SQLOrderBy), optPrio(into));

    return altPrio(chained, standalone);
  }
}
