import {CDSFunctionInput, CDSName, CDSType} from ".";
import {altPrio, Expression, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSFunction extends Expression {
  public getRunnable(): IStatementRunnable {
    const coalesce = seq("COALESCE", "(", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const concat = seq("CONCAT", "(", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const concat_with_space = seq("CONCAT_WITH_SPACE", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const dats_add_days = seq("DATS_ADD_DAYS", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const dats_add_months = seq("DATS_ADD_MONTHS", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const dats_days_between = seq("DATS_DAYS_BETWEEN", "(", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const dats_is_valid = seq("DATS_IS_VALID", "(", CDSFunctionInput, ")");
    const substring = seq("SUBSTRING", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");

    const bintohex = seq("BINTOHEX", "(", CDSFunctionInput, ")");
    const hextobin = seq("HEXTOBIN", "(", CDSFunctionInput, ")");

    const upper = seq("UPPER", "(", CDSFunctionInput, ")");
    const lower = seq("LOWER", "(", CDSFunctionInput, ")");

    const abs = seq("ABS", "(", CDSFunctionInput, ")");
    const ceil = seq("CEIL", "(", CDSFunctionInput, ")");
    const floor = seq("FLOOR", "(", CDSFunctionInput, ")");
    const round = seq("ROUND", "(", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const div = seq("DIV", "(", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const division = seq("DIVISION", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");

    const tstmp_to_dats = seq("TSTMP_TO_DATS", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const tstmp_to_tims = seq("TSTMP_TO_TIMS", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const tstmp_to_dst = seq("TSTMP_TO_DST", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const dats_tims_to_tstmp = seq("DATS_TIMS_TO_TSTMP", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");

    const tstmp_is_valid = seq("TSTMP_IS_VALID", "(", CDSFunctionInput, ")");
    const tstmp_current_utctimestamp = seq("TSTMP_CURRENT_UTCTIMESTAMP", "(", ")");
    const utcl_current = seq("UTCL_CURRENT", "(", ")");
    const tstmp_seconds_between = seq("TSTMP_SECONDS_BETWEEN", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const tstmp_add_seconds = seq("TSTMP_ADD_SECONDS", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");

    const abap_system_timezone = seq("ABAP_SYSTEM_TIMEZONE", "(", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const abap_user_timezone = seq("ABAP_USER_TIMEZONE", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");

    const mod = seq("MOD", "(", CDSFunctionInput, ",", CDSFunctionInput, ")");

    const replace = seq("REPLACE", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");

    const lpad = seq("LPAD", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const rpad = seq("RPAD", "(", CDSFunctionInput, ",", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const instr = seq("INSTR", "(", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const length = seq("LENGTH", "(", CDSFunctionInput, ")");

    const ltrim = seq("LTRIM", "(", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const rtrim = seq("RTRIM", "(", CDSFunctionInput, ",", CDSFunctionInput, ")");

    const left = seq("LEFT", "(", CDSFunctionInput, ",", CDSFunctionInput, ")");
    const right = seq("RIGHT", "(", CDSFunctionInput, ",", CDSFunctionInput, ")");

    const fltp_to_dec = seq("FLTP_TO_DEC", "(", CDSFunctionInput, "AS", CDSType, ")");

    const conversionInput = seq(CDSName, "=", ">", CDSFunctionInput);
    const conversionInputs = seq(conversionInput, starPrio(seq(",", conversionInput)));
    const unitConversion = seq("UNIT_CONVERSION", "(", conversionInputs, ")");
    const currencyConversion = seq("CURRENCY_CONVERSION", "(", conversionInputs, ")");
    const decimalShift = seq("DECIMAL_SHIFT", "(", conversionInputs, ")");

    return altPrio(substring, coalesce, tstmp_to_dats, concat, tstmp_to_tims,
                   upper, lower, abs, ceil, floor, round, div, division,
                   concat_with_space, dats_is_valid, dats_days_between, tstmp_add_seconds,
                   tstmp_seconds_between, tstmp_current_utctimestamp, tstmp_is_valid, utcl_current,
                   abap_system_timezone, abap_user_timezone, bintohex, hextobin,
                   dats_add_days, dats_add_months, tstmp_to_dst, dats_tims_to_tstmp, mod,
                   left, right, lpad, rpad, instr, length, ltrim, rtrim, replace,
                   unitConversion, currencyConversion, decimalShift, fltp_to_dec);
  }
}