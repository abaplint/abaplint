import {Expression, seq, plus, alt, altPrio, ver, optPrio, AlsoIn} from "../combi";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLFieldName} from "./sql_field_name";
import {SQLField} from "./sql_field";

export class SQLGroupBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const fieldName = alt(SQLFieldName, Dynamic);

    const expr = ver(Release.v740sp02, SQLField, {also: AlsoIn.OpenABAP});
    const newGroup = ver(Release.v740sp02,
                         seq("GROUP BY", expr, altPrio(plus(seq(",", expr)), optPrio(plus(fieldName)))),
                         {also: AlsoIn.OpenABAP});

    const old = seq(plus(seq(fieldName, ",")), fieldName);
    const oldGroup = seq("GROUP BY", altPrio(old, plus(fieldName)));

    return altPrio(newGroup, oldGroup);
  }
}