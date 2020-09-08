import {IStatement} from "./_statement";
import {verNot, str, seq, alt, opt, per, regex as reg, tok} from "../combi";
import {ParenLeft, WParenLeft, ParenRightW, ParenRight} from "../../1_lexer/tokens";
import {Integer, Source, Field, Modif, Constant, InlineField, TextElement, BlockName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SelectionScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const beginBlock = seq(str("BEGIN OF BLOCK"),
                           new BlockName(),
                           opt(str("WITH FRAME")),
                           opt(seq(str("TITLE"), alt(new InlineField(), new TextElement()))),
                           opt(str("NO INTERVALS")));
    const endBlock = seq(str("END OF BLOCK"), new BlockName());

    const nesting = seq(str("NESTING LEVEL"), new Source());

    const scrOptions = per(seq(str("AS"), alt(str("WINDOW"), str("SUBSCREEN"))),
                           seq(str("TITLE"), alt(new InlineField(), new TextElement())),
                           str("NO INTERVALS"),
                           nesting);

    const beginScreen = seq(str("BEGIN OF SCREEN"),
                            new Integer(),
                            opt(scrOptions));

    const endScreen = seq(str("END OF SCREEN"), new Integer());

    const beginLine = str("BEGIN OF LINE");
    const endLine = str("END OF LINE");

    const modif = seq(str("MODIF ID"), new Modif());

    const visible = seq(str("VISIBLE LENGTH"), reg(/^\d+$/));

    const commentOpt = per(seq(str("FOR FIELD"), new Field()),
                           modif,
                           visible);

    const position = seq(opt(reg(/^\/?[\d\w]+$/)),
                         alt(tok(ParenLeft), tok(WParenLeft)),
                         new Integer(),
                         alt(tok(ParenRightW), tok(ParenRight)));

    const comment = seq(str("COMMENT"),
                        position,
                        opt(alt(new InlineField(), new TextElement())),
                        opt(commentOpt));

    const command = seq(str("USER-COMMAND"), alt(new Field(), new Constant()));

    const push = seq(str("PUSHBUTTON"),
                     position,
                     alt(new InlineField(), new TextElement()),
                     command,
                     opt(modif),
                     opt(visible));

    const def = seq(str("DEFAULT SCREEN"), new Integer());

    const tab = seq(str("TAB"),
                    tok(WParenLeft),
                    new Integer(),
                    tok(ParenRightW),
                    alt(new InlineField(), new TextElement()),
                    command,
                    opt(def),
                    opt(modif));

    const func = seq(str("FUNCTION KEY"), new Integer());

    const skip = seq(str("SKIP"), opt(new Integer()));

    const posSymbols = alt(str("POS_LOW"),
                           str("POS_HIGH"));

    // number between 1 and 83
    const posIntegers = reg(/^(0?[1-9]|[1234567][0-9]|8[0-3])$/);

    const pos = seq(str("POSITION"),
                    alt(posIntegers,
                        posSymbols));

    const incl = seq(str("INCLUDE BLOCKS"), new BlockName());

    const tabbed = seq(str("BEGIN OF TABBED BLOCK"),
                       new InlineField(),
                       str("FOR"),
                       new Integer(),
                       str("LINES"),
                       opt(str("NO INTERVALS")));

    const uline = seq(str("ULINE"), opt(position));

    const param = seq(str("INCLUDE PARAMETERS"), new Field());
    const iso = seq(str("INCLUDE SELECT-OPTIONS"), new Field());

    const ret = seq(str("SELECTION-SCREEN"),
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
