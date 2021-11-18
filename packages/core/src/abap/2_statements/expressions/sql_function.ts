import {Version} from "../../../version";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Expression, ver, seq, tok, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Integer} from "./integer";
import {SQLAliasField} from "./sql_alias_field";
import {SQLFieldName} from "./sql_field_name";

export class SQLFunction extends Expression {
  public getRunnable(): IStatementRunnable {
    const param = altPrio(SQLFieldName, SQLAliasField);

    const castTypes = altPrio(
      seq("CHAR", tok(ParenLeftW), Integer, tok(WParenRightW)),
      "FLTP");

    const uuid = ver(Version.v754, seq("uuid", tok(ParenLeftW), tok(WParenRightW)));
    const abs = ver(Version.v740sp05, seq("abs", tok(ParenLeftW), param, tok(WParenRightW)));
    const ceil = ver(Version.v740sp05, seq("ceil", tok(ParenLeftW), param, tok(WParenRightW)));
    const floor = ver(Version.v740sp05, seq("floor", tok(ParenLeftW), param, tok(WParenRightW)));
    const div = ver(Version.v740sp05, seq("div", tok(ParenLeftW), param, ",", param, tok(WParenRightW)));
    const mod = ver(Version.v740sp05, seq("mod", tok(ParenLeftW), param, ",", param, tok(WParenRightW)));
    const cast = ver(Version.v750, seq("cast", tok(ParenLeftW), param, "AS", castTypes, tok(WParenRightW)));
    const coalesce = ver(Version.v740sp05, seq("coalesce", tok(ParenLeftW), param, ",", param, tok(WParenRightW)));

    return altPrio(uuid, abs, ceil, floor, cast, div, mod, coalesce);
  }
}