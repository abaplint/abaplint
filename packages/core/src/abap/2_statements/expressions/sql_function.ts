import {Version} from "../../../version";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Expression, ver, seq, tok, altPrio, optPrio, regex as reg} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Integer} from "./integer";
import {SQLFunctionInput} from "./sql_function_input";

export class SQLFunction extends Expression {
  public getRunnable(): IStatementRunnable {

    const castTypes = altPrio(
      seq("CHAR", optPrio(seq(tok(ParenLeftW), Integer, tok(WParenRightW)))),
      seq("DEC", tok(ParenLeftW), Integer, ",", Integer, tok(WParenRightW)),
      seq("NUMC", optPrio(seq(tok(ParenLeftW), Integer, tok(WParenRightW)))),
      "FLTP",
      "INT2",
      "INT4",
      "INT8");

    const commaParam = seq(",", SQLFunctionInput);

    // note: the function names are not keywords, they are usually in lower case
    const abs = ver(Version.v740sp05, seq(reg(/^abs$/i), tok(ParenLeftW), SQLFunctionInput, tok(WParenRightW)));
    const cast = ver(Version.v750, seq(reg(/^cast$/i), tok(ParenLeftW), SQLFunctionInput, "AS", castTypes, tok(WParenRightW)));
    const ceil = ver(Version.v740sp05, seq(reg(/^ceil$/i), tok(ParenLeftW), SQLFunctionInput, tok(WParenRightW)));
    const coalesce = ver(Version.v740sp05, seq(reg(/^coalesce$/i), tok(ParenLeftW), SQLFunctionInput, commaParam, optPrio(commaParam), tok(WParenRightW)));
    const concat = ver(Version.v750, seq(reg(/^concat$/i), tok(ParenLeftW), SQLFunctionInput, commaParam, tok(WParenRightW)));
    const div = ver(Version.v740sp05, seq(reg(/^div$/i), tok(ParenLeftW), SQLFunctionInput, commaParam, tok(WParenRightW)));
    const floor = ver(Version.v740sp05, seq(reg(/^floor$/i), tok(ParenLeftW), SQLFunctionInput, tok(WParenRightW)));
    const length = ver(Version.v750, seq(reg(/^length$/i), tok(ParenLeftW), SQLFunctionInput, tok(WParenRightW)));
    const lower = ver(Version.v751, seq(reg(/^lower$/i), tok(ParenLeftW), SQLFunctionInput, tok(WParenRightW)));
    const mod = ver(Version.v740sp05, seq(reg(/^mod$/i), tok(ParenLeftW), SQLFunctionInput, commaParam, tok(WParenRightW)));
    const replace = ver(Version.v750, seq(reg(/^replace$/i), tok(ParenLeftW), SQLFunctionInput, commaParam, commaParam, tok(WParenRightW)));
    const round = ver(Version.v750, seq(reg(/^round$/i), tok(ParenLeftW), SQLFunctionInput, commaParam, tok(WParenRightW)));
    const upper = ver(Version.v751, seq(reg(/^upper$/i), tok(ParenLeftW), SQLFunctionInput, tok(WParenRightW)));
    const uuid = ver(Version.v754, seq(reg(/^uuid$/i), tok(ParenLeftW), tok(WParenRightW)));
    const concat_with_space = ver(Version.v751, seq(reg(/^concat_with_space$/i), tok(ParenLeftW), SQLFunctionInput, commaParam, commaParam, tok(WParenRightW)));
    // dunno if the version for substring is correct
    const substring = ver(Version.v750, seq(reg(/^substring$/i), tok(ParenLeftW), SQLFunctionInput, commaParam, commaParam, tok(WParenRightW)));

    // dunno if the version for substring is correct
    const dats_is_valid = ver(Version.v754, seq(reg(/^dats_is_valid$/i), tok(ParenLeftW), SQLFunctionInput, tok(WParenRightW)));
    const dats_days_between = ver(Version.v754, seq(reg(/^dats_days_between$/i), tok(ParenLeftW), SQLFunctionInput, commaParam, tok(WParenRightW)));
    const dats_add_days = ver(Version.v754, seq(reg(/^dats_is_valid$/i), tok(ParenLeftW), SQLFunctionInput, commaParam, tok(WParenRightW)));
    const dats_add_months = ver(Version.v754, seq(reg(/^dats_is_valid$/i), tok(ParenLeftW), SQLFunctionInput, commaParam, tok(WParenRightW)));

    const ltrim = ver(Version.v750, seq(reg(/^ltrim$/i), tok(ParenLeftW), SQLFunctionInput, commaParam, tok(WParenRightW)));
    const rtrim = ver(Version.v750, seq(reg(/^rtrim$/i), tok(ParenLeftW), SQLFunctionInput, commaParam, tok(WParenRightW)));

    return altPrio(uuid, abs, ceil, floor, cast, div, mod, coalesce, concat, replace,
                   length, lower, upper, round, concat_with_space, ltrim, rtrim, substring,
                   dats_is_valid, dats_days_between, dats_add_days, dats_add_months);
  }
}