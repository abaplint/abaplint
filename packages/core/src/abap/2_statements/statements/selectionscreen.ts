import {IStatement} from "./_statement";
import {verNot, str, seq, alts, opts, pers, regex as reg, tok} from "../combi";
import {ParenLeft, WParenLeft, ParenRightW, ParenRight} from "../../1_lexer/tokens";
import {Integer, Source, Field, Modif, Constant, InlineField, TextElement, BlockName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SelectionScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const beginBlock = seq("BEGIN OF BLOCK",
                           BlockName,
                           opts("WITH FRAME"),
                           opts(seq("TITLE", alts(InlineField, TextElement))),
                           opts("NO INTERVALS"));
    const endBlock = seq("END OF BLOCK", BlockName);

    const nesting = seq("NESTING LEVEL", Source);

    const scrOptions = pers(seq("AS", alts("WINDOW", "SUBSCREEN")),
                            seq("TITLE", alts(InlineField, TextElement)),
                            "NO INTERVALS",
                            nesting);

    const beginScreen = seq("BEGIN OF SCREEN",
                            Integer,
                            opts(scrOptions));

    const endScreen = seq("END OF SCREEN", Integer);

    const beginLine = str("BEGIN OF LINE");
    const endLine = str("END OF LINE");

    const modif = seq("MODIF ID", Modif);

    const visible = seq("VISIBLE LENGTH", reg(/^\d+$/));

    const commentOpt = pers(seq("FOR FIELD", Field), modif, visible);

    const position = seq(opts(reg(/^\/?[\d\w]+$/)),
                         alts(tok(ParenLeft), tok(WParenLeft)),
                         Integer,
                         alts(tok(ParenRightW), tok(ParenRight)));

    const comment = seq("COMMENT",
                        position,
                        opts(alts(InlineField, TextElement)),
                        opts(commentOpt));

    const command = seq("USER-COMMAND", alts(Field, Constant));

    const push = seq("PUSHBUTTON",
                     position,
                     alts(InlineField, TextElement),
                     command,
                     opts(modif),
                     opts(visible));

    const def = seq("DEFAULT SCREEN", Integer);

    const tab = seq("TAB",
                    tok(WParenLeft),
                    Integer,
                    tok(ParenRightW),
                    alts(InlineField, TextElement),
                    command,
                    opts(def),
                    opts(modif));

    const func = seq("FUNCTION KEY", Integer);

    const skip = seq("SKIP", opts(Integer));

    const posSymbols = alts("POS_LOW", "POS_HIGH");

    // number between 1 and 83
    const posIntegers = reg(/^(0?[1-9]|[1234567][0-9]|8[0-3])$/);

    const pos = seq("POSITION",
                    alts(posIntegers, posSymbols));

    const incl = seq("INCLUDE BLOCKS", BlockName);

    const tabbed = seq("BEGIN OF TABBED BLOCK",
                       InlineField,
                       "FOR",
                       Integer,
                       "LINES",
                       opts("NO INTERVALS"));

    const uline = seq("ULINE", opts(position));

    const param = seq("INCLUDE PARAMETERS", Field);
    const iso = seq("INCLUDE SELECT-OPTIONS", Field);

    const ret = seq("SELECTION-SCREEN",
                    alts(comment,
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
