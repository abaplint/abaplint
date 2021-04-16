import {IStatement} from "./_statement";
import {verNot, str, seq, altPrio, alt, opt, per, regex as reg, tok} from "../combi";
import {ParenLeft, WParenLeft, ParenRightW, ParenRight} from "../../1_lexer/tokens";
import {Integer, Source, Field, Modif, Constant, InlineField, TextElement, BlockName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SelectionScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const beginBlock = seq("BEGIN OF BLOCK",
                           BlockName,
                           opt("WITH FRAME"),
                           opt(seq("TITLE", alt(InlineField, TextElement))),
                           opt("NO INTERVALS"));
    const endBlock = seq("END OF BLOCK", BlockName);

    const nesting = seq("NESTING LEVEL", Source);

    const scrOptions = per(seq("AS", alt("WINDOW", "SUBSCREEN")),
                           seq("TITLE", alt(InlineField, TextElement)),
                           "NO INTERVALS",
                           nesting);

    const beginScreen = seq("BEGIN OF SCREEN",
                            Integer,
                            opt(scrOptions));

    const endScreen = seq("END OF SCREEN", Integer);

    const beginLine = str("BEGIN OF LINE");
    const endLine = str("END OF LINE");

    const modif = seq("MODIF ID", Modif);

    const visible = seq("VISIBLE LENGTH", reg(/^\d+$/));

    const commentOpt = per(seq("FOR FIELD", Field), modif, visible);

    const position = seq(opt(reg(/^\/?[\d\w]+$/)),
                         alt(tok(ParenLeft), tok(WParenLeft)),
                         Integer,
                         alt(tok(ParenRightW), tok(ParenRight)));

    const comment = seq("COMMENT",
                        position,
                        opt(alt(InlineField, TextElement)),
                        opt(commentOpt));

    const command = seq("USER-COMMAND", alt(Field, Constant));

    const push = seq("PUSHBUTTON",
                     position,
                     alt(InlineField, TextElement),
                     command,
                     opt(modif),
                     opt(visible));

    const prog = seq("PROGRAM", Field);
    const def = seq("DEFAULT", opt(prog), "SCREEN", Integer);

    const tab = seq("TAB",
                    tok(WParenLeft),
                    Integer,
                    tok(ParenRightW),
                    alt(InlineField, TextElement),
                    command,
                    opt(def),
                    opt(modif));

    const func = seq("FUNCTION KEY", Integer);

    const skip = seq("SKIP", opt(Integer));

    const posSymbols = alt("POS_LOW", "POS_HIGH");

    // number between 1 and 83
    const posIntegers = reg(/^(0?[1-9]|[1234567][0-9]|8[0-3])$/);

    const pos = seq("POSITION",
                    alt(posIntegers, posSymbols));

    const incl = seq("INCLUDE BLOCKS", BlockName);

    const tabbed = seq("BEGIN OF TABBED BLOCK",
                       InlineField,
                       "FOR",
                       Integer,
                       "LINES",
                       opt("NO INTERVALS"));

    const uline = seq("ULINE", opt(position));

    const param = seq("INCLUDE PARAMETERS", Field);
    const iso = seq("INCLUDE SELECT-OPTIONS", Field);

    const ret = seq("SELECTION-SCREEN",
                    altPrio(comment,
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
