import {Statement} from "./statement";
import {verNot, str, seq, alt, opt, per, regex as reg, tok, IRunnable} from "../combi";
import {ParenLeft, WParenLeft, ParenRightW, ParenRight} from "../tokens";
import {Integer, Source, Field, FieldSub, Modif, Constant} from "../expressions";
import {Version} from "../../version";

export class SelectionScreen extends Statement {

  public getMatcher(): IRunnable {
    let blockName = new FieldSub();

    let beginBlock = seq(str("BEGIN OF BLOCK"),
                         blockName,
                         opt(str("WITH FRAME")),
                         opt(seq(str("TITLE"), new Source())),
                         opt(str("NO INTERVALS")));
    let endBlock = seq(str("END OF BLOCK"), blockName);

    let nesting = seq(str("NESTING LEVEL"), new Source());

    let scrOptions = per(seq(str("AS"), alt(str("WINDOW"), str("SUBSCREEN"))),
                         seq(str("TITLE"), new Source()),
                         str("NO INTERVALS"),
                         nesting);

    let beginScreen = seq(str("BEGIN OF SCREEN"),
                          new Integer(),
                          opt(scrOptions));

    let endScreen = seq(str("END OF SCREEN"), new Integer());

    let beginLine = str("BEGIN OF LINE");
    let endLine = str("END OF LINE");

    let modif = seq(str("MODIF ID"), new Modif());

    let visible = seq(str("VISIBLE LENGTH"), reg(/^\d+$/));

    let commentOpt = per(seq(str("FOR FIELD"), new Field()),
                         modif,
                         visible);

    let position = seq(opt(reg(/^\/?\d+$/)),
                       alt(tok(ParenLeft), tok(WParenLeft)),
                       new Integer(),
                       alt(tok(ParenRightW), tok(ParenRight)));

    let comment = seq(str("COMMENT"),
                      position,
                      opt(new Source()),
                      opt(commentOpt));

    let command = seq(str("USER-COMMAND"), alt(new Field(), new Constant()));

    let push = seq(str("PUSHBUTTON"),
                   position,
                   new Source(),
                   command,
                   opt(modif),
                   opt(visible));

    let def = seq(str("DEFAULT SCREEN"), new Integer());

    let tab = seq(str("TAB"),
                  tok(WParenLeft),
                  new Integer(),
                  tok(ParenRightW),
                  new FieldSub(),
                  command,
                  opt(def));

    let func = seq(str("FUNCTION KEY"), new Integer());

    let skip = seq(str("SKIP"), opt(new Integer()));

    let pos = seq(str("POSITION"), new Source());

    let incl = seq(str("INCLUDE BLOCKS"), blockName);

    let tabbed = seq(str("BEGIN OF TABBED BLOCK"),
                     new Field(),
                     str("FOR"),
                     new Integer(),
                     str("LINES"),
                     opt(str("NO INTERVALS")));

    let uline = seq(str("ULINE"), opt(position));

    let param = seq(str("INCLUDE PARAMETERS"), new Field());
    let iso = seq(str("INCLUDE SELECT-OPTIONS"), new Field());

    let ret = seq(str("SELECTION-SCREEN"),
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