import {str, seqs, per, alt, ver, Expression} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

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

    const timeStampOptions = alt(str("SPACE"),
                                 str("ISO"),
                                 str("USER"),
                                 str("ENVIRONMENT"),
                                 new Source());

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

    const width = seqs("WIDTH", "=", Source);
    const align = seqs("ALIGN", "=", alignOptions);
    const timezone = seqs("TIMEZONE", "=", Source);
    const timestamp = seqs("TIMESTAMP", "=", timeStampOptions);
    const pad = seqs("PAD", "=", Source);
    const number = seqs("NUMBER", "=", numberOptions);
    const sign = seqs("SIGN", "=", signOptions);
    const decimals = seqs("DECIMALS", "=", Source);
    const alpha = ver(Version.v740sp02, seqs("ALPHA", "=", alphaOptions));
    const xsd = ver(Version.v740sp02, seqs("XSD", "=", zeroXSDOptions));

    const formatting = alt(seqs("TIME", "=", dateTimeOptions),
                           seqs("DATE", "=", dateTimeOptions),
                           seqs("CASE", "=", caseOptions),
                           seqs("EXPONENT", Source),
                           seqs("ZERO", "=", zeroXSDOptions),
                           xsd,
                           seqs("STYLE", "=", styleOptions),
                           seqs("CURRENCY", "=", Source),
                           seqs("COUNTRY", "=", Source),
                           per(sign, number, decimals, width, pad, alpha, align),
                           per(timezone, timestamp));

    return formatting;
  }
}