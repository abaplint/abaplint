import {seq, tok, plus, altPrio, regex as reg, Expression, ver} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {SQLPathSegment} from "./sql_path_segment";
import {Field} from "./field";
import {Release} from "../../../version";

export class SQLPathForColumn extends Expression {
  public getRunnable(): IStatementRunnable {
    const tablePrefix = reg(/^(\/\w+\/)?\w+~$/);

    const withPrefix = seq(tablePrefix, plus(new SQLPathSegment(true)), tok(Dash), Field);
    const standalone = seq(plus(new SQLPathSegment()), tok(Dash), Field);

    return ver(Release.v740sp05, altPrio(withPrefix, standalone));
  }
}
