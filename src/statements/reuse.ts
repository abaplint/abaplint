import * as Combi from "../combi";

let reg = Combi.regex;
let seq = Combi.seq;
let alt = Combi.alt;
let str = Combi.str;
let re = Combi.reuse;
let star = Combi.star;

export default class Reuse {

    public static integer(): Combi.IRunnable {
        return reg(/^\d+$/);
    }

    public static typename(): Combi.IRunnable {
        return seq(reg(/^(\/\w+\/)?\w+$/),
                   star(seq(this.arrow_or_dash(), reg(/^\w+$/))));
    }

    public static field_symbol(): Combi.IRunnable {
        return re(reg(/^<(\w|_)+>$/), "field_symbol");
    }

    public static target(): Combi.IRunnable {
        let data = seq(str("DATA"), str("("), this.field(), str(")"));
        return re(alt(data,
                      seq(alt(this.field(), this.field_symbol()),
                          star(seq(this.arrow_or_dash(), this.field())))),
                  "target");
    }

    public static arrow_or_dash(): Combi.IRunnable {
        return reg(/^(->|=>|-)$/);
    }

    public static method_call(): Combi.IRunnable {
        return re(seq(this.field(),
                      str("("),
                      star(reg(/.*/)),
                      str(")")),
                  "method_call");
    }

    public static source(): Combi.IRunnable {
        return re(alt(this.constant(),
                      seq(alt(this.field(),
                              this.method_call(),
                              this.field_symbol()),
                          star(seq(this.arrow_or_dash(), this.field())))),
                  "source");
    }

    public static boolean(): Combi.IRunnable {
// todo
        return re(star(reg(/.*/)), "boolean");
    }

    public static field(): Combi.IRunnable {
        return reg(/^\w+$/);
    }

    public static constant(): Combi.IRunnable {
        return reg(/^(\w+)|('.*')|(`.*`)|(\d+)$/);
    }
}