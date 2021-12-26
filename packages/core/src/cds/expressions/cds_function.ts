import {CDSArithmetics, CDSCase, CDSCast, CDSName, CDSParameters, CDSString} from ".";
import {alt, Expression, opt, regex, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSFunction extends Expression {
  public getRunnable(): IStatementRunnable {
    const qualified = seq(CDSName, opt(CDSParameters), star(seq(".", CDSName, opt(CDSParameters))));
    const input = alt(qualified, regex(/^\d+$/), CDSCast, CDSFunction, CDSArithmetics, CDSCase, CDSString);

    const coalesce = seq("COALESCE", "(", input, ",", input, ")");
    const concat = seq("CONCAT", "(", input, ",", input, ")");
    const concat_with_space = seq("CONCAT_WITH_SPACE", "(", input, ",", input, ",", input, ")");
    const dats_add_days = seq("DATS_ADD_DAYS", "(", input, ",", input, ",", input, ")");
    const dats_add_months = seq("DATS_ADD_MONTHS", "(", input, ",", input, ",", input, ")");
    const dats_days_between = seq("DATS_DAYS_BETWEEN", "(", input, ",", input, ")");
    const dats_is_valid = seq("DATS_IS_VALID", "(", input, ")");
    const substring = seq("SUBSTRING", "(", input, ",", input, ",", input, ")");

    const bintohex = seq("BINTOHEX", "(", input, ")");
    const hextobin = seq("HEXTOBIN", "(", input, ")");

    const tstmp_to_dats = seq("TSTMP_TO_DATS", "(", input, ",", input, ",", input, ",", input, ")");
    const tstmp_to_tims = seq("TSTMP_TO_TIMS", "(", input, ",", input, ",", input, ",", input, ")");
    const tstmp_to_dst = seq("TSTMP_TO_DST", "(", input, ",", input, ",", input, ",", input, ")");
    const dats_tims_to_tstmp = seq("DATS_TIMS_TO_TSTMP", "(", input, ",", input, ",", input, ",", input, ",", input, ")");

    const tstmp_is_valid = seq("TSTMP_IS_VALID", "(", input, ")");
    const tstmp_current_utctimestamp = seq("TSTMP_CURRENT_UTCTIMESTAMP", "(", ")");
    const tstmp_seconds_between = seq("TSTMP_SECONDS_BETWEEN", "(", input, ",", input, ",", input, ")");
    const tstmp_add_seconds = seq("TSTMP_ADD_SECONDS", "(", input, ",", input, ",", input, ")");

    const abap_system_timezone = seq("ABAP_SYSTEM_TIMEZONE", "(", input, ",", input, ")");
    const abap_user_timezone = seq("ABAP_USER_TIMEZONE", "(", input, ",", input, ",", input, ")");

    return alt(substring, coalesce, tstmp_to_dats, concat, tstmp_to_tims,
               concat_with_space, dats_is_valid, dats_days_between, tstmp_add_seconds,
               tstmp_seconds_between, tstmp_current_utctimestamp, tstmp_is_valid,
               abap_system_timezone, abap_user_timezone, bintohex, hextobin,
               dats_add_days, dats_add_months, tstmp_to_dst, dats_tims_to_tstmp);
  }
}