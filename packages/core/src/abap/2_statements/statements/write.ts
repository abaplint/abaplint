import {IStatement} from "./_statement";
import {verNot, seq, opt, alt, per, altPrio} from "../combi";
import {Target, Source, Dynamic, FieldSub, Color, WriteOffsetLength} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Write implements IStatement {

  public getMatcher(): IStatementRunnable {

    const mask = seq("USING",
                     altPrio("NO EDIT MASK",
                             seq("EDIT MASK", Source)));

    const onOff = alt(altPrio("ON", "OFF"), seq("=", FieldSub));

    const dateFormat = altPrio("DD/MM/YY",
                               "MM/DD/YY",
                               "DD/MM/YYYY",
                               "MM/DD/YYYY",
                               "DDMMYY",
                               "MMDDYY",
                               "YYMMDD");

    const as = seq("AS", altPrio("LINE", "ICON", "CHECKBOX", "SYMBOL"));

    const to = seq("TO", Target);
    const options = per(mask,
                        to,
                        seq("EXPONENT", Source),
                        "NO-GROUPING",
                        "NO-ZERO",
                        "CENTERED",
                        seq("INPUT", opt(onOff)),
                        "NO-GAP",
                        "LEFT-JUSTIFIED",
                        as,
                        seq("FRAMES", onOff),
                        seq("HOTSPOT", opt(onOff)),
                        "RIGHT-JUSTIFIED",
                        seq("TIME ZONE", Source),
                        seq("UNDER", Source),
                        seq("STYLE", Source),
                        seq("ROUND", Source),
                        seq("QUICKINFO", Source),
                        "ENVIRONMENT TIME FORMAT",
                        dateFormat,
                        seq("UNIT", Source),
                        seq("INTENSIFIED", opt(onOff)),
                        seq("INDEX", Source),
                        seq("DECIMALS", Source),
                        seq("INVERSE", opt(onOff)),
                        Color,
                        seq("CURRENCY", Source),
                        "NO-SIGN");

    const ret = seq("WRITE",
                    opt(WriteOffsetLength),
                    altPrio(Source, Dynamic, "/"),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}