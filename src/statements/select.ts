import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";
import {WParenLeft, ParenLeft, ParenLeftW, WAt} from "../tokens/";
import {Version} from "../version";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let tok = Combi.tok;
let per = Combi.per;
let ver = Combi.ver;
let plus = Combi.plus;
let star = Combi.star;

export class Select extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let from = seq(str("FROM"),
                   alt(new Reuse.Dynamic(), new Reuse.DatabaseTable()),
                   opt(seq(str("AS"), new Reuse.DatabaseTable())));

    let intoList = seq(str("INTO"),
                       tok(WParenLeft),
                       star(seq(new Reuse.Target(), str(","))),
                       new Reuse.Target(),
                       str(")"));
    let intoTable = seq(alt(str("INTO"), str("APPENDING")),
                        opt(str("CORRESPONDING FIELDS OF")),
                        str("TABLE"),
                        opt(ver(Version.v740sp02, tok(WAt))),
                        new Reuse.Target());
    let intoSimple = seq(str("INTO"),
                         opt(str("CORRESPONDING FIELDS OF")),
                         opt(ver(Version.v740sp02, tok(WAt))),
                         new Reuse.Target());
    let into = alt(intoList, intoTable, intoSimple);

    let aas = seq(str("AS"), new Reuse.Field());

    let pack = seq(str("PACKAGE SIZE"), new Reuse.Source());

    let where = seq(str("WHERE"), alt(new Reuse.Cond(), new Reuse.Dynamic()));

    let order = seq(str("ORDER BY"), alt(plus(new Reuse.Field()), str("PRIMARY KEY"), new Reuse.Dynamic()));

    let forAll = seq(str("FOR ALL ENTRIES IN"), new Reuse.Source());

    let count = seq(str("COUNT"), alt(tok(ParenLeft), tok(ParenLeftW)), str("*"), str(")"));
    let max = seq(str("MAX"), alt(tok(ParenLeft), tok(ParenLeftW)), new Reuse.Field(), str(")"));
    let min = seq(str("MIN"), alt(tok(ParenLeft), tok(ParenLeftW)), new Reuse.Field(), str(")"));

    let fields = alt(str("*"),
                     new Reuse.Dynamic(),
                     count,
                     max,
                     min,
                     plus(new Reuse.Field()));

    let joinType = seq(opt(alt(str("INNER"), str("LEFT OUTER"))), str("JOIN"));

    let join = seq(joinType,
                   new Reuse.DatabaseTable(),
                   opt(aas),
                   str("ON"),
                   plus(new Reuse.Cond()));

    let up = seq(str("UP TO"), new Reuse.Source(), str("ROWS"));

    let client = str("CLIENT SPECIFIED");
    let bypass = str("BYPASSING BUFFER");

    let perm = per(from, plus(join), into, forAll, where, order, up, client, bypass, pack);

    let ret = seq(str("SELECT"),
                  alt(str("DISTINCT"), opt(seq(str("SINGLE"), opt(str("FOR UPDATE"))))),
                  fields,
                  perm);

    return ret;
  }

  public isStructure() {
    if (/ SINGLE /.test(this.concatTokens().toUpperCase())
        || / COUNT\(/.test(this.concatTokens().toUpperCase())
        || / TABLE /.test(this.concatTokens().toUpperCase())) {
      return false;
    }

    return true;
  }

  public indentationEnd() {
    return this.isStructure() ? 2 : 0;
  }

}