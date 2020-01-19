import {str, seq, per, alt, Expression, IStatementRunnable} from "../combi";
import {Source} from "./source";

export class StringTemplateFormatting extends Expression {
  public getRunnable(): IStatementRunnable {

    // https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-us/abapcompute_string_format_options.htm
    const alphaOptions = alt(str("OUT"),
                             str("RAW"),
                             str("IN"));

    const alignOptions = alt(str("LEFT"),
                             str("RIGHT"),
                             str("CENTER"));

    const dateTimeOptions = alt(str("RAW"),
                                str("ISO"),
                                str("USER"),
                                str("ENVIRONMENT"));

    const timeStampOptions = alt(str("SPACE"),
                                 str("ISO"),
                                 str("USER"),
                                 str("ENVIRONMENT"));

    const numberOptions = alt(str("RAW"),
                              str("USER"),
                              str("ENVIRONMENT"));

    const signOptions = alt(str("LEFT"),
                            str("LEFTPLUS"),
                            str("LEFTSPACE"),
                            str("RIGHT"),
                            str("RIGHTPLUS"),
                            str("RIGHTSPACE"));

    const caseOptions = alt(str("RAW"),
                            str("UPPER"),
                            str("LOWER"));

    const width = seq(str("WIDTH"), str("="), new Source());
    const aling = seq(str("ALIGN"), str("="), alignOptions);

    const formatting = alt(seq(str("ALPHA"), str("="), alphaOptions),
                           seq(str("TIME"), str("="), dateTimeOptions),
                           seq(str("DATE"), str("="), dateTimeOptions),
                           seq(str("TIMESTAMP"), str("="), timeStampOptions),
                           seq(str("NUMBER"), str("="), numberOptions),
                           seq(str("SIGN"), str("="), signOptions),
                           seq(str("CASE"), str("="), caseOptions),
                           per(width, aling));

    return formatting;
  }
}