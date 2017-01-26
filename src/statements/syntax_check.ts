import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let per = Combi.per;
let opt = Combi.opt;
let plus = Combi.plus;

export class SyntaxCheck extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let program = seq(str("PROGRAM"), new Reuse.Source());
    let offset = seq(str("OFFSET"), new Reuse.Target());
    let frame = seq(str("FRAME ENTRY"), new Reuse.Target());
    let include = seq(str("INCLUDE"), new Reuse.Target());
    let trace = seq(str("TRACE-TABLE"), new Reuse.Target());
    let line = seq(str("LINE"), new Reuse.Target());
    let word = seq(str("WORD"), new Reuse.Target());
    let messageId = seq(str("MESSAGE-ID"), new Reuse.Target());
    let message = seq(str("MESSAGE"), new Reuse.Target());
    let id = seq(str("ID"), new Reuse.Source(), str("TABLE"), new Reuse.Target());
    let replacing = seq(str("REPLACING"), new Reuse.Target());
    let directory = seq(str("DIRECTORY ENTRY"), new Reuse.Source());
    let dump = seq(str("SHORTDUMP-ID"), new Reuse.Source());

    let syntax = seq(opt(str("PROGRAM")),
                     new Reuse.Source(),
                     per(message,
                         line,
                         word,
                         offset,
                         program,
                         replacing,
                         directory,
                         frame,
                         include,
                         messageId,
                         trace,
                         dump,
                         plus(id)));

    let dynpro = seq(str("DYNPRO"),
                     new Reuse.Source(),
                     new Reuse.Source(),
                     new Reuse.Source(),
                     new Reuse.Source(),
                     per(message, line, word, offset, messageId));

    return seq(str("SYNTAX-CHECK FOR"), alt(syntax, dynpro));
  }

}