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

const VARIADIC = -1;

type SQLFunctionDef = [string, number, Version];

export const sqlFunctionDefs: SQLFunctionDef[] = [
  ["abs", 1, Version.v740sp05],
  ["ceil", 1, Version.v740sp05],
  ["floor", 1, Version.v740sp05],
  ["div", 2, Version.v740sp05],
  ["mod", 2, Version.v740sp05],
  ["coalesce", VARIADIC, Version.v740sp05],
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
  ["concat_with_space", 3, Version.v751],
  ["rpad", 3, Version.v751],
  ["left", 2, Version.v751],
  ["lower", 1, Version.v751],
  ["upper", 1, Version.v751],
  ["division", 3, Version.v751],
  ["bintohex", 1, Version.v752],
  ["hextobin", 1, Version.v752],
  ["dats_is_valid", 1, Version.v754],
  ["dats_days_between", 2, Version.v754],
  ["dats_add_days", 2, Version.v754],
  ["dats_add_months", 2, Version.v754],
  ["uuid", 0, Version.v754],
  ["utcl_current", 0, Version.v754],
  ["tstmp_current_utctimestamp", 0, Version.v757],
  ["tstmp_is_valid", 1, Version.v757],
  ["tims_is_valid", 1, Version.v757],
  ["utcl_add_seconds", 2, Version.v757],
  ["utcl_seconds_between", 2, Version.v757],
  ["datn_days_between", 2, Version.v757],
  ["datn_add_days", 2, Version.v757],
  ["datn_add_months", 2, Version.v757],
  ["as_geo_json", 1, Version.v757],
  ["allow_precision_loss", 1, Version.v757],
  ["to_clob", 1, Version.v757],
  ["to_blob", 1, Version.v757],
  ["grouping", 1, Version.v757],
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
  ["sin", 1, Version.v758],
  ["cos", 1, Version.v758],
  ["tan", 1, Version.v758],
  ["asin", 1, Version.v758],
  ["acos", 1, Version.v758],
  ["atan", 1, Version.v758],
  ["sinh", 1, Version.v758],
  ["cosh", 1, Version.v758],
  ["tanh", 1, Version.v758],
  ["sqrt", 1, Version.v758],
  ["power", 2, Version.v758],
  ["exp", 1, Version.v758],
  ["ln", 1, Version.v758],
  ["log10", 1, Version.v758],
  ["log", 2, Version.v758],
  ["utctolocal", 2, Version.v758],
  ["localtoutc", 2, Version.v758],
  ["is_masked", 1, Version.v758],
];

type SQLNamedParamValue = "any" | "abap_only";
type SQLNamedParam = { name: string; value: SQLNamedParamValue; optional?: true };
type SQLNamedFunctionDef = [string, Version, SQLNamedParam[]];

export const sqlNamedFunctionDefs: SQLNamedFunctionDef[] = [
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
  ["ipow", Version.v758, [
    {name: "base", value: "any"},
    {name: "exp", value: "any"},
  ]],
];

export const sqlSpatialFunctionDefs: SQLFunctionDef[] = [
  ["st_new_point", VARIADIC, Version.v758],
  ["st_new_pointz", VARIADIC, Version.v758],
  ["st_new_pointm", VARIADIC, Version.v758],
  ["st_new_pointzm", VARIADIC, Version.v758],
  ["st_new_linestring", VARIADIC, Version.v758],
  ["st_new_multilinestring", VARIADIC, Version.v758],
  ["st_new_polygon", VARIADIC, Version.v758],
  ["st_new_multipolygon", VARIADIC, Version.v758],
  ["st_new_multipoint", VARIADIC, Version.v758],
  ["st_new_circularstring", VARIADIC, Version.v758],
  ["st_new_geometrycollection", VARIADIC, Version.v758],
  ["st_srid", VARIADIC, Version.v758],
  ["st_relate", VARIADIC, Version.v758],
  ["st_geomfromtext", VARIADIC, Version.Cloud],
  ["st_geomfromwkt", VARIADIC, Version.Cloud],
  ["st_geomfromewkt", VARIADIC, Version.Cloud],
  ["st_geomfromwkb", VARIADIC, Version.Cloud],
  ["st_geomfromewkb", VARIADIC, Version.Cloud],
  ["st_geomfromgeojson", VARIADIC, Version.Cloud],
  ["st_geomfromesrijson", VARIADIC, Version.Cloud],
  ["st_geomfromgeohash", VARIADIC, Version.Cloud],
  ["st_pointfromtext", VARIADIC, Version.Cloud],
  ["st_pointfromgeohash", VARIADIC, Version.Cloud],
  ["st_makeline", VARIADIC, Version.Cloud],
  ["st_makepolygon", VARIADIC, Version.Cloud],
  ["st_x", VARIADIC, Version.Cloud],
  ["st_y", VARIADIC, Version.Cloud],
  ["st_z", VARIADIC, Version.Cloud],
  ["st_m", VARIADIC, Version.Cloud],
  ["st_xmax", VARIADIC, Version.Cloud],
  ["st_xmin", VARIADIC, Version.Cloud],
  ["st_ymax", VARIADIC, Version.Cloud],
  ["st_ymin", VARIADIC, Version.Cloud],
  ["st_zmax", VARIADIC, Version.Cloud],
  ["st_zmin", VARIADIC, Version.Cloud],
  ["st_mmax", VARIADIC, Version.Cloud],
  ["st_mmin", VARIADIC, Version.Cloud],
  ["st_area", VARIADIC, Version.Cloud],
  ["st_length", VARIADIC, Version.Cloud],
  ["st_perimeter", VARIADIC, Version.Cloud],
  ["st_dimension", VARIADIC, Version.Cloud],
  ["st_coorddim", VARIADIC, Version.Cloud],
  ["st_geometrytype", VARIADIC, Version.Cloud],
  ["st_isempty", VARIADIC, Version.Cloud],
  ["st_issimple", VARIADIC, Version.Cloud],
  ["st_isclosed", VARIADIC, Version.Cloud],
  ["st_isring", VARIADIC, Version.Cloud],
  ["st_isvalid", VARIADIC, Version.Cloud],
  ["st_isvalidtrajectory", VARIADIC, Version.Cloud],
  ["st_is3d", VARIADIC, Version.Cloud],
  ["st_ismeasured", VARIADIC, Version.Cloud],
  ["st_invalidreason", VARIADIC, Version.Cloud],
  ["st_numpoints", VARIADIC, Version.Cloud],
  ["st_numgeometries", VARIADIC, Version.Cloud],
  ["st_numinteriorring", VARIADIC, Version.Cloud],
  ["st_numinteriorrings", VARIADIC, Version.Cloud],
  ["st_envelope", VARIADIC, Version.Cloud],
  ["st_boundary", VARIADIC, Version.Cloud],
  ["st_exteriorring", VARIADIC, Version.Cloud],
  ["st_startpoint", VARIADIC, Version.Cloud],
  ["st_endpoint", VARIADIC, Version.Cloud],
  ["st_centroid", VARIADIC, Version.Cloud],
  ["st_pointonsurface", VARIADIC, Version.Cloud],
  ["st_convexhull", VARIADIC, Version.Cloud],
  ["st_concavehull", VARIADIC, Version.Cloud],
  ["st_reverse", VARIADIC, Version.Cloud],
  ["st_force2d", VARIADIC, Version.Cloud],
  ["st_force3dz", VARIADIC, Version.Cloud],
  ["st_force3dm", VARIADIC, Version.Cloud],
  ["st_force4d", VARIADIC, Version.Cloud],
  ["st_makevalid", VARIADIC, Version.Cloud],
  ["st_geohash", VARIADIC, Version.Cloud],
  ["st_aswkt", VARIADIC, Version.Cloud],
  ["st_aswkb", VARIADIC, Version.Cloud],
  ["st_asewkt", VARIADIC, Version.Cloud],
  ["st_asewkb", VARIADIC, Version.Cloud],
  ["st_asbinary", VARIADIC, Version.Cloud],
  ["st_astext", VARIADIC, Version.Cloud],
  ["st_asgeojson", VARIADIC, Version.Cloud],
  ["st_asesrijson", VARIADIC, Version.Cloud],
  ["st_assvg", VARIADIC, Version.Cloud],
  ["st_distance", VARIADIC, Version.Cloud],
  ["st_withindistance", VARIADIC, Version.Cloud],
  ["st_contains", VARIADIC, Version.Cloud],
  ["st_covers", VARIADIC, Version.Cloud],
  ["st_coveredby", VARIADIC, Version.Cloud],
  ["st_crosses", VARIADIC, Version.Cloud],
  ["st_disjoint", VARIADIC, Version.Cloud],
  ["st_equals", VARIADIC, Version.Cloud],
  ["st_orderingequals", VARIADIC, Version.Cloud],
  ["st_intersects", VARIADIC, Version.Cloud],
  ["st_intersectsfilter", VARIADIC, Version.Cloud],
  ["st_intersectsrect", VARIADIC, Version.Cloud],
  ["st_intersectsrectplanar", VARIADIC, Version.Cloud],
  ["st_overlaps", VARIADIC, Version.Cloud],
  ["st_touches", VARIADIC, Version.Cloud],
  ["st_within", VARIADIC, Version.Cloud],
  ["st_intersection", VARIADIC, Version.Cloud],
  ["st_union", VARIADIC, Version.Cloud],
  ["st_difference", VARIADIC, Version.Cloud],
  ["st_symdifference", VARIADIC, Version.Cloud],
  ["st_collect", VARIADIC, Version.Cloud],
  ["st_buffer", VARIADIC, Version.Cloud],
  ["st_transform", VARIADIC, Version.Cloud],
  ["st_rotate", VARIADIC, Version.Cloud],
  ["st_scale", VARIADIC, Version.Cloud],
  ["st_translate", VARIADIC, Version.Cloud],
  ["st_translate3d", VARIADIC, Version.Cloud],
  ["st_simplify", VARIADIC, Version.Cloud],
  ["st_snaptogrid", VARIADIC, Version.Cloud],
  ["st_addmeasure", VARIADIC, Version.Cloud],
  ["st_addpoint", VARIADIC, Version.Cloud],
  ["st_removepoint", VARIADIC, Version.Cloud],
  ["st_pointn", VARIADIC, Version.Cloud],
  ["st_geometryn", VARIADIC, Version.Cloud],
  ["st_interiorringn", VARIADIC, Version.Cloud],
  ["st_lineinterpolatepoint", VARIADIC, Version.Cloud],
  ["st_linelocatepoint", VARIADIC, Version.Cloud],
  ["st_linesubstring", VARIADIC, Version.Cloud],
  ["st_locatealong", VARIADIC, Version.Cloud],
  ["st_locatebetween", VARIADIC, Version.Cloud],
  ["st_alphashape", VARIADIC, Version.Cloud],
  ["st_alphashapearea", VARIADIC, Version.Cloud],
  ["st_alphashapeedge", VARIADIC, Version.Cloud],
  ["st_closestpointofapproach", VARIADIC, Version.Cloud],
  ["st_frechetdistance", VARIADIC, Version.Cloud],
  ["st_hausdorffdistance", VARIADIC, Version.Cloud],
  ["st_3dlength", VARIADIC, Version.Cloud],
  ["st_asmvtgeom", VARIADIC, Version.Cloud],
];

export const sqlSpatialAggregateDefs: SQLFunctionDef[] = [
  ["st_assvgaggr", VARIADIC, Version.Cloud],
  ["st_collectaggr", VARIADIC, Version.Cloud],
  ["st_concavehullaggr", VARIADIC, Version.Cloud],
  ["st_convexhullaggr", VARIADIC, Version.Cloud],
  ["st_envelopeaggr", VARIADIC, Version.Cloud],
  ["st_intersectionaggr", VARIADIC, Version.Cloud],
  ["st_unionaggr", VARIADIC, Version.Cloud],
  ["st_alphashapeaggr", VARIADIC, Version.Cloud],
  ["st_alphashapeareaaggr", VARIADIC, Version.Cloud],
  ["st_alphashapeedgeaggr", VARIADIC, Version.Cloud],
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

    const castInput = altPrio(SQLCase, SQLFunctionInput);
    const cast = ver(Version.v750, seq(reg(/^cast$/i), tok(ParenLeftW), castInput, "AS", castTypes, tok(WParenRightW)));

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
      ...sqlSpatialFunctionDefs.map(([name, params, v]) => fn(name, params, v)),
      ...sqlSpatialAggregateDefs.map(([name, params, v]) => fn(name, params, v)),
    );
  }
}
