import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";
import {WParenLeft, ParenLeft, ParenLeftW} from "../tokens/";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let tok = Combi.tok;
let per = Combi.per;
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
                        new Reuse.Target());
    let intoSimple = seq(str("INTO"),
                         opt(str("CORRESPONDING FIELDS OF")),
                         new Reuse.Target());
    let into = alt(intoList, intoTable, intoSimple);

    let aas = seq(str("AS"), new Reuse.Field());

    let where = seq(str("WHERE"), alt(new Reuse.Cond(), new Reuse.Dynamic()));

    let order = seq(str("ORDER BY"), alt(plus(new Reuse.Field()), str("PRIMARY KEY"), new Reuse.Dynamic()));

    let forAll = seq(str("FOR ALL ENTRIES IN"), new Reuse.Source());

    let count = seq(str("COUNT"), alt(tok(ParenLeft), tok(ParenLeftW)), str("*"), str(")"));

    let fields = alt(str("*"), count, plus(new Reuse.Field()));

    let join = seq(opt(str("INNER")),
                   str("JOIN"),
                   new Reuse.DatabaseTable(),
                   opt(aas),
                   str("ON"),
                   plus(new Reuse.Cond()));

    let up = seq(str("UP TO"), new Reuse.Source(), str("ROWS"));

    let client = str("CLIENT SPECIFIED");
    let bypass = str("BYPASSING BUFFER");

    let perm = per(from, plus(join), into, forAll, where, order, up, client, bypass);

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