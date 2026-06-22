import {ABAPRelease, Release} from "../../../version";
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

const VARIADIC = -1;

type SQLFunctionDef = [string, number, ABAPRelease];

export const sqlFunctionDefs: SQLFunctionDef[] = [
  ["abs", 1, Release.v740sp05],
  ["ceil", 1, Release.v740sp05],
  ["floor", 1, Release.v740sp05],
  ["div", 2, Release.v740sp05],
  ["mod", 2, Release.v740sp05],
  ["coalesce", VARIADIC, Release.v740sp05],
  ["concat", 2, Release.v750],
  ["length", 1, Release.v750],
  ["ltrim", 2, Release.v750],
  ["rtrim", 2, Release.v750],
  ["right", 2, Release.v750],
  ["replace", 3, Release.v750],
  ["round", 2, Release.v750],
  ["substring", 3, Release.v750],
  ["lpad", 3, Release.v750],
  ["instr", 2, Release.v750],
  ["concat_with_space", 3, Release.v751],
  ["rpad", 3, Release.v751],
  ["left", 2, Release.v751],
  ["lower", 1, Release.v751],
  ["upper", 1, Release.v751],
  ["division", 3, Release.v751],
  ["bintohex", 1, Release.v752],
  ["hextobin", 1, Release.v752],
  ["dats_is_valid", 1, Release.v754],
  ["dats_days_between", 2, Release.v754],
  ["dats_add_days", 2, Release.v754],
  ["dats_add_months", 2, Release.v754],
  ["uuid", 0, Release.v754],
  ["utcl_current", 0, Release.v754],
  ["tstmp_current_utctimestamp", 0, Release.v757],
  ["tstmp_is_valid", 1, Release.v757],
  ["tims_is_valid", 1, Release.v757],
  ["utcl_add_seconds", 2, Release.v757],
  ["utcl_seconds_between", 2, Release.v757],
  ["datn_days_between", 2, Release.v757],
  ["datn_add_days", 2, Release.v757],
  ["datn_add_months", 2, Release.v757],
  ["as_geo_json", 1, Release.v757],
  ["allow_precision_loss", 1, Release.v757],
  ["to_clob", 1, Release.v757],
  ["to_blob", 1, Release.v757],
  ["grouping", 1, Release.v757],
  ["extract_year", 1, Release.v758],
  ["extract_month", 1, Release.v758],
  ["extract_day", 1, Release.v758],
  ["extract_hour", 1, Release.v758],
  ["extract_minute", 1, Release.v758],
  ["extract_second", 1, Release.v758],
  ["days_between", 2, Release.v758],
  ["add_days", 2, Release.v758],
  ["add_months", 2, Release.v758],
  ["monthname", 1, Release.v758],
  ["dayname", 1, Release.v758],
  ["initcap", 1, Release.v758],
  ["is_valid", 1, Release.v758],
  ["weekday", 1, Release.v758],
  ["locate", VARIADIC, Release.v758],
  ["greatest", VARIADIC, Release.v758],
  ["least", VARIADIC, Release.v758],
  ["hierarchy_composite_id", VARIADIC, Release.v758],
  ["sin", 1, Release.v758],
  ["cos", 1, Release.v758],
  ["tan", 1, Release.v758],
  ["asin", 1, Release.v758],
  ["acos", 1, Release.v758],
  ["atan", 1, Release.v758],
  ["sinh", 1, Release.v758],
  ["cosh", 1, Release.v758],
  ["tanh", 1, Release.v758],
  ["sqrt", 1, Release.v758],
  ["power", 2, Release.v758],
  ["exp", 1, Release.v758],
  ["ln", 1, Release.v758],
  ["log10", 1, Release.v758],
  ["log", 2, Release.v758],
  ["utctolocal", 2, Release.v758],
  ["localtoutc", 2, Release.v758],
  ["is_masked", 1, Release.v758],
];

type SQLNamedParamValue = "any" | "abap_only";
type SQLNamedParam = { name: string; value: SQLNamedParamValue; optional?: true };
type SQLNamedFunctionDef = [string, ABAPRelease, SQLNamedParam[]];

export const sqlNamedFunctionDefs: SQLNamedFunctionDef[] = [
  ["abap_user_timezone", Release.v757, [
    {name: "user", value: "any", optional: true},
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["abap_system_timezone", Release.v757, [
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["dats_tims_to_tstmp", Release.v757, [
    {name: "date", value: "any"},
    {name: "time", value: "any"},
    {name: "tzone", value: "any"},
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["tstmp_add_seconds", Release.v757, [
    {name: "tstmp", value: "any"},
    {name: "seconds", value: "any"},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["tstmp_seconds_between", Release.v757, [
    {name: "tstmp1", value: "any"},
    {name: "tstmp2", value: "any"},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["tstmp_to_dats", Release.v757, [
    {name: "tstmp", value: "any"},
    {name: "tzone", value: "any", optional: true},
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["tstmp_to_tims", Release.v757, [
    {name: "tstmp", value: "any"},
    {name: "tzone", value: "any", optional: true},
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["tstmp_to_dst", Release.v757, [
    {name: "tstmp", value: "any"},
    {name: "tzone", value: "any", optional: true},
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["tstmpl_to_utcl", Release.v757, [
    {name: "tstmpl", value: "any"},
    {name: "on_error", value: "abap_only", optional: true},
    {name: "on_initial", value: "abap_only", optional: true},
  ]],
  ["tstmpl_from_utcl", Release.v757, [
    {name: "utcl", value: "any"},
    {name: "on_null", value: "abap_only", optional: true},
  ]],
  ["dats_to_datn", Release.v757, [
    {name: "dats", value: "any"},
    {name: "on_error", value: "abap_only", optional: true},
    {name: "on_initial", value: "abap_only", optional: true},
  ]],
  ["dats_from_datn", Release.v757, [
    {name: "datn", value: "any"},
    {name: "on_null", value: "abap_only", optional: true},
  ]],
  ["tims_to_timn", Release.v757, [
    {name: "tims", value: "any"},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["tims_from_timn", Release.v757, [
    {name: "timn", value: "any"},
    {name: "on_null", value: "abap_only", optional: true},
  ]],
  ["currency_conversion", Release.v757, [
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
  ["unit_conversion", Release.v758, [
    {name: "quantity", value: "any"},
    {name: "source_unit", value: "any"},
    {name: "target_unit", value: "any"},
    {name: "client", value: "any", optional: true},
    {name: "on_error", value: "abap_only", optional: true},
  ]],
  ["curr_to_decfloat_amount", Release.v758, [
    {name: "curr", value: "any"},
    {name: "cuky", value: "any"},
  ]],
  ["lang_to_char", Release.v758, [
    {name: "lang", value: "any"},
  ]],
  ["ipow", Release.v758, [
    {name: "base", value: "any"},
    {name: "exp", value: "any"},
  ]],
];

export const sqlSpatialFunctionDefs: SQLFunctionDef[] = [
  ["st_new_point", VARIADIC, Release.v915],
  ["st_new_pointz", VARIADIC, Release.v915],
  ["st_new_pointm", VARIADIC, Release.v915],
  ["st_new_pointzm", VARIADIC, Release.v915],
  ["st_new_linestring", VARIADIC, Release.v915],
  ["st_new_multilinestring", VARIADIC, Release.v915],
  ["st_new_polygon", VARIADIC, Release.v915],
  ["st_new_multipolygon", VARIADIC, Release.v915],
  ["st_new_multipoint", VARIADIC, Release.v915],
  ["st_new_circularstring", VARIADIC, Release.v915],
  ["st_new_geometrycollection", VARIADIC, Release.v915],
  ["st_srid", VARIADIC, Release.v915],
  ["st_relate", VARIADIC, Release.v915],
  ["st_geomfromtext", VARIADIC, Release.v915],
  ["st_geomfromwkt", VARIADIC, Release.v915],
  ["st_geomfromewkt", VARIADIC, Release.v915],
  ["st_geomfromwkb", VARIADIC, Release.v915],
  ["st_geomfromewkb", VARIADIC, Release.v915],
  ["st_geomfromgeojson", VARIADIC, Release.v915],
  ["st_geomfromesrijson", VARIADIC, Release.v915],
  ["st_geomfromgeohash", VARIADIC, Release.v915],
  ["st_pointfromtext", VARIADIC, Release.v915],
  ["st_pointfromgeohash", VARIADIC, Release.v915],
  ["st_makeline", VARIADIC, Release.v915],
  ["st_makepolygon", VARIADIC, Release.v915],
  ["st_x", VARIADIC, Release.v915],
  ["st_y", VARIADIC, Release.v915],
  ["st_z", VARIADIC, Release.v915],
  ["st_m", VARIADIC, Release.v915],
  ["st_xmax", VARIADIC, Release.v915],
  ["st_xmin", VARIADIC, Release.v915],
  ["st_ymax", VARIADIC, Release.v915],
  ["st_ymin", VARIADIC, Release.v915],
  ["st_zmax", VARIADIC, Release.v915],
  ["st_zmin", VARIADIC, Release.v915],
  ["st_mmax", VARIADIC, Release.v915],
  ["st_mmin", VARIADIC, Release.v915],
  ["st_area", VARIADIC, Release.v915],
  ["st_length", VARIADIC, Release.v915],
  ["st_perimeter", VARIADIC, Release.v915],
  ["st_dimension", VARIADIC, Release.v915],
  ["st_coorddim", VARIADIC, Release.v915],
  ["st_geometrytype", VARIADIC, Release.v915],
  ["st_isempty", VARIADIC, Release.v915],
  ["st_issimple", VARIADIC, Release.v915],
  ["st_isclosed", VARIADIC, Release.v915],
  ["st_isring", VARIADIC, Release.v915],
  ["st_isvalid", VARIADIC, Release.v915],
  ["st_isvalidtrajectory", VARIADIC, Release.v915],
  ["st_is3d", VARIADIC, Release.v915],
  ["st_ismeasured", VARIADIC, Release.v915],
  ["st_invalidreason", VARIADIC, Release.v915],
  ["st_numpoints", VARIADIC, Release.v915],
  ["st_numgeometries", VARIADIC, Release.v915],
  ["st_numinteriorring", VARIADIC, Release.v915],
  ["st_numinteriorrings", VARIADIC, Release.v915],
  ["st_envelope", VARIADIC, Release.v915],
  ["st_boundary", VARIADIC, Release.v915],
  ["st_exteriorring", VARIADIC, Release.v915],
  ["st_startpoint", VARIADIC, Release.v915],
  ["st_endpoint", VARIADIC, Release.v915],
  ["st_centroid", VARIADIC, Release.v915],
  ["st_pointonsurface", VARIADIC, Release.v915],
  ["st_convexhull", VARIADIC, Release.v915],
  ["st_concavehull", VARIADIC, Release.v915],
  ["st_reverse", VARIADIC, Release.v915],
  ["st_force2d", VARIADIC, Release.v915],
  ["st_force3dz", VARIADIC, Release.v915],
  ["st_force3dm", VARIADIC, Release.v915],
  ["st_force4d", VARIADIC, Release.v915],
  ["st_makevalid", VARIADIC, Release.v915],
  ["st_geohash", VARIADIC, Release.v915],
  ["st_aswkt", VARIADIC, Release.v915],
  ["st_aswkb", VARIADIC, Release.v915],
  ["st_asewkt", VARIADIC, Release.v915],
  ["st_asewkb", VARIADIC, Release.v915],
  ["st_asbinary", VARIADIC, Release.v915],
  ["st_astext", VARIADIC, Release.v915],
  ["st_asgeojson", VARIADIC, Release.v915],
  ["st_asesrijson", VARIADIC, Release.v915],
  ["st_assvg", VARIADIC, Release.v915],
  ["st_distance", VARIADIC, Release.v915],
  ["st_withindistance", VARIADIC, Release.v915],
  ["st_contains", VARIADIC, Release.v915],
  ["st_covers", VARIADIC, Release.v915],
  ["st_coveredby", VARIADIC, Release.v915],
  ["st_crosses", VARIADIC, Release.v915],
  ["st_disjoint", VARIADIC, Release.v915],
  ["st_equals", VARIADIC, Release.v915],
  ["st_orderingequals", VARIADIC, Release.v915],
  ["st_intersects", VARIADIC, Release.v915],
  ["st_intersectsfilter", VARIADIC, Release.v915],
  ["st_intersectsrect", VARIADIC, Release.v915],
  ["st_intersectsrectplanar", VARIADIC, Release.v915],
  ["st_overlaps", VARIADIC, Release.v915],
  ["st_touches", VARIADIC, Release.v915],
  ["st_within", VARIADIC, Release.v915],
  ["st_intersection", VARIADIC, Release.v915],
  ["st_union", VARIADIC, Release.v915],
  ["st_difference", VARIADIC, Release.v915],
  ["st_symdifference", VARIADIC, Release.v915],
  ["st_collect", VARIADIC, Release.v915],
  ["st_buffer", VARIADIC, Release.v915],
  ["st_transform", VARIADIC, Release.v915],
  ["st_rotate", VARIADIC, Release.v915],
  ["st_scale", VARIADIC, Release.v915],
  ["st_translate", VARIADIC, Release.v915],
  ["st_translate3d", VARIADIC, Release.v915],
  ["st_simplify", VARIADIC, Release.v915],
  ["st_snaptogrid", VARIADIC, Release.v915],
  ["st_addmeasure", VARIADIC, Release.v915],
  ["st_addpoint", VARIADIC, Release.v915],
  ["st_removepoint", VARIADIC, Release.v915],
  ["st_pointn", VARIADIC, Release.v915],
  ["st_geometryn", VARIADIC, Release.v915],
  ["st_interiorringn", VARIADIC, Release.v915],
  ["st_lineinterpolatepoint", VARIADIC, Release.v915],
  ["st_linelocatepoint", VARIADIC, Release.v915],
  ["st_linesubstring", VARIADIC, Release.v915],
  ["st_locatealong", VARIADIC, Release.v915],
  ["st_locatebetween", VARIADIC, Release.v915],
  ["st_alphashape", VARIADIC, Release.v915],
  ["st_alphashapearea", VARIADIC, Release.v915],
  ["st_alphashapeedge", VARIADIC, Release.v915],
  ["st_closestpointofapproach", VARIADIC, Release.v915],
  ["st_frechetdistance", VARIADIC, Release.v915],
  ["st_hausdorffdistance", VARIADIC, Release.v915],
  ["st_3dlength", VARIADIC, Release.v915],
  ["st_asmvtgeom", VARIADIC, Release.v915],
];

export const sqlSpatialAggregateDefs: SQLFunctionDef[] = [
  ["st_assvgaggr", VARIADIC, Release.v915],
  ["st_collectaggr", VARIADIC, Release.v915],
  ["st_concavehullaggr", VARIADIC, Release.v915],
  ["st_convexhullaggr", VARIADIC, Release.v915],
  ["st_envelopeaggr", VARIADIC, Release.v915],
  ["st_intersectionaggr", VARIADIC, Release.v915],
  ["st_unionaggr", VARIADIC, Release.v915],
  ["st_alphashapeaggr", VARIADIC, Release.v915],
  ["st_alphashapeareaaggr", VARIADIC, Release.v915],
  ["st_alphashapeedgeaggr", VARIADIC, Release.v915],
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

    const fn = (name: string, params: number, v: ABAPRelease): IStatementRunnable => {
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

    const castInput = altPrio(SQLCase, SQLFunctionInput);
    const cast = ver(Release.v750, seq(reg(/^cast$/i), tok(ParenLeftW), castInput, "AS", castTypes, tok(WParenRightW)));

    const hostParen = seq(tok(ParenLeftW), SQLFunctionInput, tok(WParenRightW));
    const hostVar = seq(tok(WAt), altPrio(SimpleSource3, hostParen));
    const abapOnly = altPrio(Constant, hostVar);
    const namedFn = (name: string, v: ABAPRelease, params: SQLNamedParam[]): IStatementRunnable => {
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
      ...sqlSpatialFunctionDefs.map(([name, params, v]) => fn(name, params, v)),
      ...sqlSpatialAggregateDefs.map(([name, params, v]) => fn(name, params, v)),
    );
  }
}
