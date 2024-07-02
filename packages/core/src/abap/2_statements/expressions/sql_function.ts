import {Constant} from "./constant";
import {Version} from "../../../version";
import {ParenLeftW, WAt, WParenRightW} from "../../1_lexer/tokens";
import {Expression, ver, seq, tok, altPrio, optPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Integer} from "./integer";
import {SQLAliasField} from "./sql_alias_field";
import {SQLFieldName} from "./sql_field_name";
import {SimpleSource3} from "./simple_source3";
import {Source} from "./source";
import {SQLAggregation} from "./sql_aggregation";

export class SQLFunction extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(ParenLeftW), Source, tok(WParenRightW));
    const at = ver(Version.v740sp05, seq(tok(WAt), altPrio(SimpleSource3, paren)));

    const param = altPrio(SQLFunction, SQLAggregation, SQLFieldName, SQLAliasField, Constant, at);

    const castTypes = altPrio(
      seq("CHAR", tok(ParenLeftW), Integer, tok(WParenRightW)),
      seq("DEC", tok(ParenLeftW), Integer, ",", Integer, tok(WParenRightW)),
      "FLTP",
      "NUMC",
      "INT8");

    const commaParam = seq(",", param);

    const abs = ver(Version.v740sp05, seq("abs", tok(ParenLeftW), param, tok(WParenRightW)));
    const cast = ver(Version.v750, seq("cast", tok(ParenLeftW), param, "AS", castTypes, tok(WParenRightW)));
    const ceil = ver(Version.v740sp05, seq("ceil", tok(ParenLeftW), param, tok(WParenRightW)));
    const coalesce = ver(Version.v740sp05, seq("coalesce", tok(ParenLeftW), param, commaParam, optPrio(commaParam), tok(WParenRightW)));
    const concat = ver(Version.v750, seq("concat", tok(ParenLeftW), param, commaParam, tok(WParenRightW)));
    const div = ver(Version.v740sp05, seq("div", tok(ParenLeftW), param, commaParam, tok(WParenRightW)));
    const floor = ver(Version.v740sp05, seq("floor", tok(ParenLeftW), param, tok(WParenRightW)));
    const length = ver(Version.v750, seq("length", tok(ParenLeftW), param, tok(WParenRightW)));
    const lower = ver(Version.v751, seq("lower", tok(ParenLeftW), param, tok(WParenRightW)));
    const mod = ver(Version.v740sp05, seq("mod", tok(ParenLeftW), param, commaParam, tok(WParenRightW)));
    const replace = ver(Version.v750, seq("replace", tok(ParenLeftW), param, commaParam, commaParam, tok(WParenRightW)));
    const round = ver(Version.v750, seq("round", tok(ParenLeftW), param, commaParam, tok(WParenRightW)));
    const upper = ver(Version.v751, seq("upper", tok(ParenLeftW), param, tok(WParenRightW)));
    const uuid = ver(Version.v754, seq("uuid", tok(ParenLeftW), tok(WParenRightW)));

    return altPrio(uuid, abs, ceil, floor, cast, div, mod, coalesce, concat, replace, length, lower, upper, round);
  }
}