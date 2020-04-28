import {str, seq, per, alt, Expression} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class StringTemplateFormatting extends Expression {
  public getRunnable(): IStatementRunnable {

    // https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-us/abapcompute_string_format_options.htm
    const alphaOptions = alt(str("OUT"),
                             str("RAW"),
                             str("IN"),
                             new Source());

    const alignOptions = alt(str("LEFT"),
                             str("RIGHT"),
                             str("CENTER"),
                             new Source());

    const dateTimeOptions = alt(str("RAW"),
                                str("ISO"),
                                str("USER"),
                                str("ENVIRONMENT"),
                                new Source());

    const timeStampOptions = (alt(str("SPACE"),
                                  str("ISO"),
                                  str("USER"),
                                  str("ENVIRONMENT"),
                                  new Source()));

    const numberOptions = alt(str("RAW"),
                              str("USER"),
                              str("ENVIRONMENT"),
                              new Source());

    const signOptions = alt(str("LEFT"),
                            str("LEFTPLUS"),
                            str("LEFTSPACE"),
                            str("RIGHT"),
                            str("RIGHTPLUS"),
                            str("RIGHTSPACE"),
                            new Source());

    const caseOptions = alt(str("RAW"),
                            str("UPPER"),
                            str("LOWER"),
                            new Source());

    const zeroXSDOptions = alt(str("YES"),
                               str("NO"),
                               new Source());

    const styleOptions = alt(str("SIMPLE"),
                             str("SIGN_AS_POSTFIX"),
                             str("SCALE_PRESERVING"),
                             str("SCIENTIFIC"),
                             str("SCIENTIFIC_WITH_LEADING_ZERO"),
                             str("SCALE_PRESERVING_SCIENTIFIC"),
                             str("ENGINEERING "),
                             new Source());

    const width = seq(str("WIDTH"), str("="), new Source());
    const align = seq(str("ALIGN"), str("="), alignOptions);
    const timezone = seq(str("TIMEZONE"), str("="), new Source());
    const timestamp = seq(str("TIMESTAMP"), str("="), timeStampOptions);
    const pad = seq(str("PAD"), str("="), new Source());
    const number = seq(str("NUMBER"), str("="), numberOptions);
    const sign = seq(str("SIGN"), str("="), signOptions);
    const decimals = seq(str("DECIMALS"), str("="), new Source());

    const formatting = alt(seq(str("ALPHA"), str("="), alphaOptions),
                           seq(str("TIME"), str("="), dateTimeOptions),
                           seq(str("DATE"), str("="), dateTimeOptions),
                           seq(str("CASE"), str("="), caseOptions),
                           seq(str("EXPONENT"), new Source()),
                           seq(str("ZERO"), str("="), zeroXSDOptions),
                           seq(str("XSD"), str("="), zeroXSDOptions),
                           seq(str("STYLE"), str("="), styleOptions),
                           seq(str("CURRENCY"), str("="), new Source()),
                           seq(str("COUNTRY"), str("="), new Source()),
                           per(sign, number, decimals),
                           per(timezone, timestamp),
                           per(width, pad, align));

    return formatting;
  }
}