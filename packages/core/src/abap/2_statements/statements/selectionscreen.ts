import {IStatement} from "./_statement";
import {verNot, str, seqs, alts, opts, pers, regex as reg, tok} from "../combi";
import {ParenLeft, WParenLeft, ParenRightW, ParenRight} from "../../1_lexer/tokens";
import {Integer, Source, Field, Modif, Constant, InlineField, TextElement, BlockName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SelectionScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const beginBlock = seqs("BEGIN OF BLOCK",
                            BlockName,
                            opts("WITH FRAME"),
                            opts(seqs("TITLE", alts(InlineField, TextElement))),
                            opts("NO INTERVALS"));
    const endBlock = seqs("END OF BLOCK", BlockName);

    const nesting = seqs("NESTING LEVEL", Source);

    const scrOptions = pers(seqs("AS", alts("WINDOW", "SUBSCREEN")),
                            seqs("TITLE", alts(InlineField, TextElement)),
                            "NO INTERVALS",
                            nesting);

    const beginScreen = seqs("BEGIN OF SCREEN",
                             Integer,
                             opts(scrOptions));

    const endScreen = seqs("END OF SCREEN", Integer);

    const beginLine = str("BEGIN OF LINE");
    const endLine = str("END OF LINE");

    const modif = seqs("MODIF ID", Modif);

    const visible = seqs("VISIBLE LENGTH", reg(/^\d+$/));

    const commentOpt = pers(seqs("FOR FIELD", Field), modif, visible);

    const position = seqs(opts(reg(/^\/?[\d\w]+$/)),
                          alts(tok(ParenLeft), tok(WParenLeft)),
                          Integer,
                          alts(tok(ParenRightW), tok(ParenRight)));

    const comment = seqs("COMMENT",
                         position,
                         opts(alts(InlineField, TextElement)),
                         opts(commentOpt));

    const command = seqs("USER-COMMAND", alts(Field, Constant));

    const push = seqs("PUSHBUTTON",
                      position,
                      alts(InlineField, TextElement),
                      command,
                      opts(modif),
                      opts(visible));

    const def = seqs("DEFAULT SCREEN", Integer);

    const tab = seqs("TAB",
                     tok(WParenLeft),
                     Integer,
                     tok(ParenRightW),
                     alts(InlineField, TextElement),
                     command,
                     opts(def),
                     opts(modif));

    const func = seqs("FUNCTION KEY", Integer);

    const skip = seqs("SKIP", opts(Integer));

    const posSymbols = alts("POS_LOW", "POS_HIGH");

    // number between 1 and 83
    const posIntegers = reg(/^(0?[1-9]|[1234567][0-9]|8[0-3])$/);

    const pos = seqs("POSITION",
                     alts(posIntegers, posSymbols));

    const incl = seqs("INCLUDE BLOCKS", BlockName);

    const tabbed = seqs("BEGIN OF TABBED BLOCK",
                        InlineField,
                        "FOR",
                        Integer,
                        "LINES",
                        opts("NO INTERVALS"));

    const uline = seqs("ULINE", opts(position));

    const param = seqs("INCLUDE PARAMETERS", Field);
    const iso = seqs("INCLUDE SELECT-OPTIONS", Field);

    const ret = seqs("SELECTION-SCREEN",
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
