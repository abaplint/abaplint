import {seq, pers, alts, vers, Expression} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class StringTemplateFormatting extends Expression {
  public getRunnable(): IStatementRunnable {

    // https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-us/abapcompute_string_format_options.htm
    const alphaOptions = alts("OUT",
                              "RAW",
                              "IN",
                              Source);

    const alignOptions = alts("LEFT",
                              "RIGHT",
                              "CENTER",
                              Source);

    const dateTimeOptions = alts("RAW",
                                 "ISO",
                                 "USER",
                                 "ENVIRONMENT",
                                 Source);

    const timeStampOptions = alts("SPACE",
                                  "ISO",
                                  "USER",
                                  "ENVIRONMENT",
                                  Source);

    const numberOptions = alts("RAW",
                               "USER",
                               "ENVIRONMENT",
                               Source);

    const signOptions = alts("LEFT",
                             "LEFTPLUS",
                             "LEFTSPACE",
                             "RIGHT",
                             "RIGHTPLUS",
                             "RIGHTSPACE",
                             Source);

    const caseOptions = alts("RAW",
                             "UPPER",
                             "LOWER",
                             Source);

    const zeroXSDOptions = alts("YES",
                                "NO",
                                Source);

    const styleOptions = alts("SIMPLE",
                              "SIGN_AS_POSTFIX",
                              "SCALE_PRESERVING",
                              "SCIENTIFIC",
                              "SCIENTIFIC_WITH_LEADING_ZERO",
                              "SCALE_PRESERVING_SCIENTIFIC",
                              "ENGINEERING",
                              Source);

    const width = seq("WIDTH =", Source);
    const align = seq("ALIGN =", alignOptions);
    const timezone = seq("TIMEZONE =", Source);
    const timestamp = seq("TIMESTAMP =", timeStampOptions);
    const pad = seq("PAD =", Source);
    const number = seq("NUMBER =", numberOptions);
    const sign = seq("SIGN =", signOptions);
    const decimals = seq("DECIMALS =", Source);
    const alpha = vers(Version.v740sp02, seq("ALPHA =", alphaOptions));
    const xsd = vers(Version.v740sp02, seq("XSD =", zeroXSDOptions));

    const formatting = alts(seq("TIME =", dateTimeOptions),
                            seq("DATE =", dateTimeOptions),
                            seq("CASE =", caseOptions),
                            seq("EXPONENT", Source),
                            seq("ZERO =", zeroXSDOptions),
                            xsd,
                            seq("STYLE =", styleOptions),
                            seq("CURRENCY =", Source),
                            seq("COUNTRY =", Source),
                            pers(sign, number, decimals, width, pad, alpha, align),
                            pers(timezone, timestamp));

    return formatting;
  }
}