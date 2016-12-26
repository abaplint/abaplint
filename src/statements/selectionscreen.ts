import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";
import {ParenLeft, WParenLeft, ParenRightW} from "../tokens";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let per = Combi.per;
let reg = Combi.regex;
let tok = Combi.tok;

export class SelectionScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let blockName = reg(/^\w+$/);

    let beginBlock = seq(str("BEGIN OF BLOCK"),
                         blockName,
                         opt(str("WITH FRAME")),
                         opt(seq(str("TITLE"), new Reuse.Source())),
                         opt(str("NO INTERVALS")));
    let endBlock = seq(str("END OF BLOCK"), blockName);

    let nesting = seq(str("NESTING LEVEL"), new Reuse.Source());

    let beginScreen = seq(str("BEGIN OF SCREEN"),
                          new Reuse.Integer(),
                          opt(seq(str("AS"), alt(str("WINDOW"), str("SUBSCREEN")))),
                          opt(seq(str("TITLE"), new Reuse.Source())),
                          opt(str("NO INTERVALS")),
                          opt(nesting));

    let endScreen = seq(str("END OF SCREEN"), new Reuse.Integer());

    let beginLine = str("BEGIN OF LINE");
    let endLine = str("END OF LINE");

    let commentOpt = per(seq(str("FOR FIELD"), new Reuse.Field()),
                         seq(str("MODIF ID"), new Reuse.Field()));

    let comment = seq(str("COMMENT"),
                      opt(reg(/^\/?\d+$/)),
                      alt(tok(ParenLeft), tok(WParenLeft)),
                      new Reuse.Integer(),
                      tok(ParenRightW),
                      opt(new Reuse.Source()),
                      opt(commentOpt));


    let tab = seq(str("TAB"),
                  tok(WParenLeft),
                  new Reuse.Integer(),
                  tok(ParenRightW),
                  new Reuse.Field(),
                  str("USER-COMMAND"),
                  new Reuse.Field(),
                  str("DEFAULT SCREEN"),
                  new Reuse.Integer());

    let func = seq(str("FUNCTION KEY"), new Reuse.Integer());

    let skip = seq(str("SKIP"), opt(new Reuse.Integer()));

    let pos = seq(str("POSITION"), new Reuse.Integer());

    let incl = seq(str("INCLUDE BLOCKS"), blockName);

    let tabbed = seq(str("BEGIN OF TABBED BLOCK"),
                     new Reuse.Field(),
                     str("FOR"),
                     new Reuse.Integer(),
                     str("LINES"));

    let ret = seq(str("SELECTION-SCREEN"),
                  alt(comment,
                      func,
                      skip,
                      pos,
                      incl,
                      tab,
                      str("ULINE"),
                      beginBlock,
                      tabbed,
                      endBlock,
                      beginLine,
                      endLine,
                      beginScreen,
                      endScreen));

    return ret;
  }

}