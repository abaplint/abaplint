import {Version} from "../../../version";
import {ParenLeftW, WAt, WParenRightW} from "../../1_lexer/tokens";
import {Expression, ver, seq, tok, altPrio, optPrio, starPrio, regex as reg} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Integer} from "./integer";
import {SQLFunctionInput} from "./sql_function_input";
import {SQLCase} from "./sql_case";
import {SimpleSource3} from "./simple_source3";
import {Constant} from "./constant";
import {SQLReplaceRegexpr} from "./sql_replace_regexpr";
import {SQLOccurrencesRegexpr} from "./sql_occurrences_regexpr";
import {SQLSubstringRegexpr} from "./sql_substring_regexpr";
import {SQLLocateRegexpr} from "./sql_locate_regexpr";

// param count sentinel: function accepts 1 or more arguments (variadic)
const VARIADIC = -1;

// [name, paramCount, version]
// paramCount: 0 = no args, N = exactly N args, VARIADIC = 1 or more args
type SQLFunctionDef = [string, number, Version];

export const sqlFunctionDefs: SQLFunctionDef[] = [
  // arithmetic (v740sp05 / Rel745)
  ["abs", 1, Version.v740sp05],
  ["ceil", 1, Version.v740sp05],
  ["floor", 1, Version.v740sp05],
  ["div", 2, Version.v740sp05],
  ["mod", 2, Version.v740sp05],
  ["coalesce", VARIADIC, Version.v740sp05],
  // string (v750 / Rel745-746)
  ["concat", 2, Version.v750],
  ["length", 1, Version.v750],
  ["ltrim", 2, Version.v750],
  ["rtrim", 2, Version.v750],
  ["right", 2, Version.v750],
  ["replace", 3, Version.v750],
  ["round", 2, Version.v750],
  ["substring", 3, Version.v750],
  ["lpad", 3, Version.v750],
  ["instr", 2, Version.v750],
  // string (v751 / Rel747-749)
  ["concat_with_space", 3, Version.v751],
  ["rpad", 3, Version.v751],
  ["left", 2, Version.v751],
  ["lower", 1, Version.v751],
  ["upper", 1, Version.v751],
  ["division", 3, Version.v751],
  // hex conversion (v752 / Rel752)
  ["bintohex", 1, Version.v752],
  ["hextobin", 1, Version.v752],
  // date (v754 / Rel749)
  ["dats_is_valid", 1, Version.v754],
  ["dats_days_between", 2, Version.v754],
  ["dats_add_days", 2, Version.v754],
  ["dats_add_months", 2, Version.v754],
  // uuid, utcl_current (v754 / Rel777)
  ["uuid", 0, Version.v754],
  ["utcl_current", 0, Version.v754],
  // timestamp / time (v757 / Rel770)
  ["tstmp_current_utctimestamp", 0, Version.v757],
  ["tstmp_is_valid", 1, Version.v757],
  ["tims_is_valid", 1, Version.v757],
  // utcl arithmetic, datn, geo_json, lob, precision (v757 / Rel778-780)
  ["utcl_add_seconds", 2, Version.v757],
  ["utcl_seconds_between", 2, Version.v757],
  ["datn_days_between", 2, Version.v757],
  ["datn_add_days", 2, Version.v757],
  ["datn_add_months", 2, Version.v757],
  ["as_geo_json", 1, Version.v757],
  ["allow_precision_loss", 1, Version.v757],
  ["to_clob", 1, Version.v757],
  ["to_blob", 1, Version.v757],
  // grouping (v757 / Rel772)
  ["grouping", 1, Version.v757],
  // extract, date-time, string (v758 / Rel783-784)
  ["extract_year", 1, Version.v758],
  ["extract_month", 1, Version.v758],
  ["extract_day", 1, Version.v758],
  ["extract_hour", 1, Version.v758],
  ["extract_minute", 1, Version.v758],
  ["extract_second", 1, Version.v758],
  ["days_between", 2, Version.v758],
  ["add_days", 2, Version.v758],
  ["add_months", 2, Version.v758],
  ["monthname", 1, Version.v758],
  ["dayname", 1, Version.v758],
  ["initcap", 1, Version.v758],
  ["is_valid", 1, Version.v758],
  ["weekday", 1, Version.v758],
  ["locate", VARIADIC, Version.v758],
  ["greatest", VARIADIC, Version.v758],
  ["least", VARIADIC, Version.v758],
  ["hierarchy_composite_id", VARIADIC, Version.v758],
  // trigonometric (v758 / Rel916)
  ["sin", 1, Version.v758],
  ["cos", 1, Version.v758],
  ["tan", 1, Version.v758],
  ["asin", 1, Version.v758],
  ["acos", 1, Version.v758],
  ["atan", 1, Version.v758],
  ["sinh", 1, Version.v758],
  ["cosh", 1, Version.v758],
  ["tanh", 1, Version.v758],
  // power / logarithm (v758 / Rel916)
  ["sqrt", 1, Version.v758],
  ["power", 2, Version.v758],
  ["exp", 1, Version.v758],
  ["ln", 1, Version.v758],
  ["log10", 1, Version.v758],
  ["log", 2, Version.v758],
  // timezone conversion (v758 / Rel920)
  ["utctolocal", 2, Version.v758],
  ["localtoutc", 2, Version.v758],
  // is_masked (v758 / Rel915)
  ["is_masked", 1, Version.v758],
];

// Named-parameter function definition: [name, version, params]
// value: "any" = any SQL expression incl. DB columns, "abap_only" = @hostvar or literal only
type SQLNamedParamValue = "any" | "abap_only";
type SQLNamedParam = { name: string; value: SQLNamedParamValue; optional?: true };
type SQLNamedFunctionDef = [string, Version, SQLNamedParam[]];

export const sqlNamedFunctionDefs: SQLNamedFunctionDef[] = [
  // v757 / Rel770
  ["abap_user_timezone", Version.v757, [
    {name: "user", value: "any", optional: true},
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["abap_system_timezone", Version.v757, [
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["dats_tims_to_tstmp", Version.v757, [
    {name: "date", value: "any"},
    {name: "time", value: "any"},
    {name: "tzone", value: "any"},
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["tstmp_add_seconds", Version.v757, [
    {name: "tstmp", value: "any"},
    {name: "seconds", value: "any"},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["tstmp_seconds_between", Version.v757, [
    {name: "tstmp1", value: "any"},
    {name: "tstmp2", value: "any"},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["tstmp_to_dats", Version.v757, [
    {name: "tstmp", value: "any"},
    {name: "tzone", value: "any", optional: true},
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["tstmp_to_tims", Version.v757, [
    {name: "tstmp", value: "any"},
    {name: "tzone", value: "any", optional: true},
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["tstmp_to_dst", Version.v757, [
    {name: "tstmp", value: "any"},
    {name: "tzone", value: "any", optional: true},
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  // v757 / Rel778
  ["tstmpl_to_utcl", Version.v757, [
    {name: "tstmpl", value: "any"},
    {name: "on_error", value: "abap_only", optional: true},
    {name: "on_initial", value: "abap_only", optional: true},
  ]],
  ["tstmpl_from_utcl", Version.v757, [
    {name: "utcl", value: "any"},
    {name: "on_null", value: "abap_only", optional: true},
  ]],
  ["dats_to_datn", Version.v757, [
    {name: "dats", value: "any"},
    {name: "on_error", value: "abap_only", optional: true},
    {name: "on_initial", value: "abap_only", optional: true},
  ]],
  ["dats_from_datn", Version.v757, [
    {name: "datn", value: "any"},
    {name: "on_null", value: "abap_only", optional: true},
  ]],
  ["tims_to_timn", Version.v757, [
    {name: "tims", value: "any"},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["tims_from_timn", Version.v757, [
    {name: "timn", value: "any"},
    {name: "on_null", value: "abap_only", optional: true},
  ]],
  // v757 / Rel779
  ["currency_conversion", Version.v757, [
    {name: "amount", value: "any"},
    {name: "source_currency", value: "any"},
    {name: "target_currency", value: "any"},
    {name: "exchange_rate_date", value: "any"},
    {name: "exchange_rate_type", value: "any", optional: true},
    {name: "client", value: "any", optional: true},
    {name: "round", value: "abap_only", optional: true},
    {name: "decimal_shift", value: "abap_only", optional: true},
    {name: "decimal_shift_back", value: "abap_only", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  // v758 / Rel783
  ["unit_conversion", Version.v758, [
    {name: "quantity", value: "any"},
    {name: "source_unit", value: "any"},
    {name: "target_unit", value: "any"},
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["curr_to_decfloat_amount", Version.v758, [
    {name: "curr", value: "any"},
    {name: "cuky", value: "any"},
  ]],
  ["lang_to_char", Version.v758, [
    {name: "lang", value: "any"},
  ]],
  // v758 — ipow uses named params base/exp
  ["ipow", Version.v758, [
    {name: "base", value: "any"},
    {name: "exp", value: "any"},
  ]],
];

export class SQLFunction extends Expression {
  public getRunnable(): IStatementRunnable {

    const castTypes = altPrio(
      seq("CHAR", optPrio(seq(tok(ParenLeftW), Integer, tok(WParenRightW)))),
      seq("DEC", tok(ParenLeftW), Integer, ",", Integer, tok(WParenRightW)),
      seq("NUMC", optPrio(seq(tok(ParenLeftW), Integer, tok(WParenRightW)))),
      "DATS",
      "FLTP",
      "INT1",
      "INT2",
      "INT4",
      "INT8");

    const commaParam = seq(",", SQLFunctionInput);

    // build a versioned SQL function rule from name, fixed param count (or VARIADIC for 1+), and version
    const fn = (name: string, params: number, v: Version): IStatementRunnable => {
      const nameReg = reg(new RegExp("^" + name + "$", "i"));
      if (params === 0) {
        return ver(v, seq(nameReg, tok(ParenLeftW), tok(WParenRightW)));
      } else if (params === VARIADIC) {
        return ver(v, seq(nameReg, tok(ParenLeftW), SQLFunctionInput, starPrio(commaParam), tok(WParenRightW)));
      } else {
        const extra: IStatementRunnable[] = [];
        for (let i = 1; i < params; i++) {
          extra.push(commaParam);
        }
        return ver(v, seq(nameReg, tok(ParenLeftW), SQLFunctionInput, ...extra, tok(WParenRightW)));
      }
    };

    // CAST has special syntax: CAST( expr AS type )
    const castInput = altPrio(SQLCase, SQLFunctionInput);
    const cast = ver(Version.v750, seq(reg(/^cast$/i), tok(ParenLeftW), castInput, "AS", castTypes, tok(WParenRightW)));

    // build a versioned named-parameter SQL function: NAME( KEY = VALUE, ... )
    // value type: "any" = SQLFunctionInput (any SQL expr incl. DB columns)
    //             "abap_only" = @hostvar or literal only (no DB column references)
    // params are comma-separated and can appear in any order
    const hostParen = seq(tok(ParenLeftW), SQLFunctionInput, tok(WParenRightW));
    const hostVar = seq(tok(WAt), altPrio(SimpleSource3, hostParen));
    const abapOnly = altPrio(Constant, hostVar);
    const namedFn = (name: string, v: Version, params: SQLNamedParam[]): IStatementRunnable => {
      const nameReg = reg(new RegExp("^" + name + "$", "i"));
      const valueFor = (p: SQLNamedParam): IStatementRunnable | (new () => Expression) =>
        p.value === "abap_only" ? abapOnly : SQLFunctionInput;
      const kvs = params.map(p => seq(reg(new RegExp("^" + p.name + "$", "i")), "=", valueFor(p)));
      const anyKv = kvs.length === 1 ? kvs[0] : altPrio(kvs[0], kvs[1], ...kvs.slice(2));
      const body = optPrio(seq(anyKv, starPrio(seq(",", anyKv))));
      return ver(v, seq(nameReg, tok(ParenLeftW), body, tok(WParenRightW)));
    };

    return altPrio(
      cast,
      SQLReplaceRegexpr,
      SQLOccurrencesRegexpr,
      SQLSubstringRegexpr,
      SQLLocateRegexpr,
      ...sqlFunctionDefs.map(([name, params, v]) => fn(name, params, v)),
      ...sqlNamedFunctionDefs.map(([name, v, params]) => namedFn(name, v, params)),
    );
  }
}
