import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";
import {ParenLeft, WParenLeft, ParenRightW, ParenRight} from "../tokens";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let per = Combi.per;
let reg = Combi.regex;
let tok = Combi.tok;

export class SelectionScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let blockName = new Reuse.FieldSub();

    let beginBlock = seq(str("BEGIN OF BLOCK"),
                         blockName,
                         opt(str("WITH FRAME")),
                         opt(seq(str("TITLE"), new Reuse.Source())),
                         opt(str("NO INTERVALS")));
    let endBlock = seq(str("END OF BLOCK"), blockName);

    let nesting = seq(str("NESTING LEVEL"), new Reuse.Source());

    let scrOptions = per(seq(str("AS"), alt(str("WINDOW"), str("SUBSCREEN"))),
                         seq(str("TITLE"), new Reuse.Source()),
                         str("NO INTERVALS"),
                         nesting);

    let beginScreen = seq(str("BEGIN OF SCREEN"),
                          new Reuse.Integer(),
                          opt(scrOptions));

    let endScreen = seq(str("END OF SCREEN"), new Reuse.Integer());

    let beginLine = str("BEGIN OF LINE");
    let endLine = str("END OF LINE");

    let modif = seq(str("MODIF ID"), new Reuse.Modif());

    let visible = seq(str("VISIBLE LENGTH"), reg(/^\d+$/));

    let commentOpt = per(seq(str("FOR FIELD"), new Reuse.Field()),
                         modif,
                         visible);

    let position = seq(opt(reg(/^\/?\d+$/)),
                       alt(tok(ParenLeft), tok(WParenLeft)),
                       new Reuse.Integer(),
                       alt(tok(ParenRightW), tok(ParenRight)));

    let comment = seq(str("COMMENT"),
                      position,
                      opt(new Reuse.Source()),
                      opt(commentOpt));

    let command = seq(str("USER-COMMAND"), alt(new Reuse.Field(), new Reuse.Constant()));

    let push = seq(str("PUSHBUTTON"),
                   position,
                   new Reuse.Source(),
                   command,
                   opt(modif),
                   opt(visible));

    let def = seq(str("DEFAULT SCREEN"), new Reuse.Integer());

    let tab = seq(str("TAB"),
                  tok(WParenLeft),
                  new Reuse.Integer(),
                  tok(ParenRightW),
                  new Reuse.FieldSub(),
                  command,
                  opt(def));

    let func = seq(str("FUNCTION KEY"), new Reuse.Integer());

    let skip = seq(str("SKIP"), opt(new Reuse.Integer()));

    let pos = seq(str("POSITION"), new Reuse.Source());

    let incl = seq(str("INCLUDE BLOCKS"), blockName);

    let tabbed = seq(str("BEGIN OF TABBED BLOCK"),
                     new Reuse.Field(),
                     str("FOR"),
                     new Reuse.Integer(),
                     str("LINES"),
                     opt(str("NO INTERVALS")));

    let uline = seq(str("ULINE"), opt(position));

    let param = seq(str("INCLUDE PARAMETERS"), new Reuse.Field());
    let iso = seq(str("INCLUDE SELECT-OPTIONS"), new Reuse.Field());

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

    return ret;
  }

}