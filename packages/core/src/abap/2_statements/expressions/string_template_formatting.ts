import {seqs, per, alts, ver, Expression} from "../combi";
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

    const formatting = alts(seqs("TIME", "=", dateTimeOptions),
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