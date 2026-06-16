import {Expression, seq, plus, alt, altPrio, ver, optPrio} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLFieldName} from "./sql_field_name";
import {SQLField} from "./sql_field";

export class SQLGroupBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const fieldName = alt(SQLFieldName, Dynamic);

    const expr = ver(Version.v740sp02, SQLField, Version.OpenABAP);
    const newGroup = ver(Version.v740sp02,
                         seq("GROUP BY", expr, altPrio(plus(seq(",", expr)), optPrio(plus(fieldName)))),
                         Version.OpenABAP);

    const old = seq(plus(seq(fieldName, ",")), fieldName);
    const oldGroup = seq("GROUP BY", altPrio(old, plus(fieldName)));

    return altPrio(newGroup, oldGroup);
  }
}