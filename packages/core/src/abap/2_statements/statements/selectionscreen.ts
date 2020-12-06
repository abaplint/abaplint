import {IStatement} from "./_statement";
import {verNot, str, seqs, alt, opt, per, regex as reg, tok} from "../combi";
import {ParenLeft, WParenLeft, ParenRightW, ParenRight} from "../../1_lexer/tokens";
import {Integer, Source, Field, Modif, Constant, InlineField, TextElement, BlockName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SelectionScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const beginBlock = seqs("BEGIN OF BLOCK",
                            BlockName,
                            opt(str("WITH FRAME")),
                            opt(seqs("TITLE", alt(new InlineField(), new TextElement()))),
                            opt(str("NO INTERVALS")));
    const endBlock = seqs("END OF BLOCK", BlockName);

    const nesting = seqs("NESTING LEVEL", Source);

    const scrOptions = per(seqs("AS", alt(str("WINDOW"), str("SUBSCREEN"))),
                           seqs("TITLE", alt(new InlineField(), new TextElement())),
                           str("NO INTERVALS"),
                           nesting);

    const beginScreen = seqs("BEGIN OF SCREEN",
                             Integer,
                             opt(scrOptions));

    const endScreen = seqs("END OF SCREEN", Integer);

    const beginLine = str("BEGIN OF LINE");
    const endLine = str("END OF LINE");

    const modif = seqs("MODIF ID", Modif);

    const visible = seqs("VISIBLE LENGTH", reg(/^\d+$/));

    const commentOpt = per(seqs("FOR FIELD", Field),
                           modif,
                           visible);

    const position = seqs(opt(reg(/^\/?[\d\w]+$/)),
                          alt(tok(ParenLeft), tok(WParenLeft)),
                          Integer,
                          alt(tok(ParenRightW), tok(ParenRight)));

    const comment = seqs("COMMENT",
                         position,
                         opt(alt(new InlineField(), new TextElement())),
                         opt(commentOpt));

    const command = seqs("USER-COMMAND", alt(new Field(), new Constant()));

    const push = seqs("PUSHBUTTON",
                      position,
                      alt(new InlineField(), new TextElement()),
                      command,
                      opt(modif),
                      opt(visible));

    const def = seqs("DEFAULT SCREEN", Integer);

    const tab = seqs("TAB",
                     tok(WParenLeft),
                     Integer,
                     tok(ParenRightW),
                     alt(new InlineField(), new TextElement()),
                     command,
                     opt(def),
                     opt(modif));

    const func = seqs("FUNCTION KEY", Integer);

    const skip = seqs("SKIP", opt(new Integer()));

    const posSymbols = alt(str("POS_LOW"),
                           str("POS_HIGH"));

    // number between 1 and 83
    const posIntegers = reg(/^(0?[1-9]|[1234567][0-9]|8[0-3])$/);

    const pos = seqs("POSITION",
                     alt(posIntegers,
                         posSymbols));

    const incl = seqs("INCLUDE BLOCKS", BlockName);

    const tabbed = seqs("BEGIN OF TABBED BLOCK",
                        InlineField,
                        "FOR",
                        Integer,
                        "LINES",
                        opt(str("NO INTERVALS")));

    const uline = seqs("ULINE", opt(position));

    const param = seqs("INCLUDE PARAMETERS", Field);
    const iso = seqs("INCLUDE SELECT-OPTIONS", Field);

    const ret = seqs("SELECTION-SCREEN",
                     alt(comment,
                         func,
                         skip,
                         pos,
                         incl,
                         iso,
                         push,
                         tab,
                         uline,
                         beginBlock,
                         tabbed,
                         endBlock,
                         beginLine,
                         endLine,
                         param,
                         beginScreen,
                         endScreen));

    return verNot(Version.Cloud, ret);
  }

}
