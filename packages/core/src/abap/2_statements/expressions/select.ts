import {seq, Expression, altPrio, optPrio, plusPrio, ver, AlsoIn} from "../combi";
import {SQLIntoTable, SQLOrderBy, SQLIntoList, SQLSetOp} from ".";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLIntoStructure} from "./sql_into_structure";
import {buildSelectCore, buildSelectSingleCore} from "./_select_core";

export class Select extends Expression {
  public getRunnable(): IStatementRunnable {
    const into = altPrio(SQLIntoTable, SQLIntoStructure, SQLIntoList);

    const standalone = altPrio(
      seq("SINGLE", optPrio("FOR UPDATE"), buildSelectSingleCore(true)),
      buildSelectCore(true),
    );

    const unionTail = ver(Release.v750, plusPrio(SQLSetOp), {also: AlsoIn.OpenABAP});
    const chained = seq(buildSelectCore(false, false), unionTail, optPrio(SQLOrderBy), optPrio(into));

    return seq("SELECT", altPrio(chained, standalone));
  }
}
