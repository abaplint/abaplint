import {seq, per, altPrio, ver, Expression} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {Dynamic} from "./dynamic";

export class StringTemplateFormatting extends Expression {
  public getRunnable(): IStatementRunnable {

    // https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-us/abapcompute_string_format_options.htm
    const alphaOptions = altPrio("OUT", "RAW", "IN", Source);

    const alignOptions = altPrio("LEFT", "RIGHT", "CENTER", Source);

    const dateTimeOptions = altPrio("RAW", "ISO", "USER", "ENVIRONMENT", Source, Dynamic);

    const timeStampOptions = altPrio("SPACE", "ISO", "USER", "ENVIRONMENT", Source);

    const numberOptions = altPrio("RAW", "USER", "ENVIRONMENT", Source);

    const signOptions = altPrio("LEFT", "LEFTPLUS", "LEFTSPACE", "RIGHT", "RIGHTPLUS", "RIGHTSPACE", Source);

    const caseOptions = altPrio("RAW", "UPPER", "LOWER", Source, Dynamic);

    const zeroXSDOptions = altPrio("YES", "NO", Source);

    const styleOptions = altPrio("SIMPLE",
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
    const alpha = ver(Version.v740sp02, seq("ALPHA =", alphaOptions));
    const xsd = ver(Version.v740sp02, seq("XSD =", zeroXSDOptions));

    const formatting = altPrio(seq("TIME =", dateTimeOptions),
                               seq("DATE =", dateTimeOptions),
                               seq("CASE =", caseOptions),
                               seq("EXPONENT", Source),
                               seq("ZERO =", zeroXSDOptions),
                               xsd,
                               seq("STYLE =", styleOptions),
                               seq("CURRENCY =", Source),
                               seq("COUNTRY =", Source),
                               per(sign, number, decimals, width, pad, alpha, align),
                               per(timezone, timestamp));

    return formatting;
  }
}