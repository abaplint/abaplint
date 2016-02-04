import * as Combi from "../combi";

let reg = Combi.regex;
let seq = Combi.seq;
let alt = Combi.alt;
let str = Combi.str;
let opt = Combi.opt;
let re = Combi.reuse;
let star = Combi.star;

export default class Reuse {

    public static integer(): Combi.Reuse {
        return re(reg(/^\d+$/), "integer");
    }

    public static typename(): Combi.Reuse {
        return re(seq(reg(/^(\/\w+\/)?\w+$/),
                      star(seq(this.arrow_or_dash(),
                               reg(/^\w+$/)))),
                  "typename");
    }

    public static field_symbol(): Combi.Reuse {
        return re(reg(/^<(\w|_)+>$/), "field_symbol");
    }

    public static target(): Combi.Reuse {
        let data = seq(str("DATA"), str("("), this.field(), str(")"));
        return re(alt(data,
                      seq(alt(this.field(), this.field_symbol()),
                          star(seq(this.arrow_or_dash(), this.field())))),
                  "target");
    }

    public static arrow_or_dash(): Combi.Reuse {
        return re(reg(/^(->|=>|-)$/), "arrow_or_dash");
    }

    public static parameter(): Combi.Reuse {
// todo
        let anything = star(reg(/.*/));
        return re(seq(this.field(), str("="), anything), "parameter");
    }

    public static parameter_list(): Combi.Reuse {
        return re(seq(this.parameter(), star(this.parameter())), "parameter_list");
    }

    public static method_call(): Combi.Reuse {
        let exporting = seq(str("EXPORTING"), this.parameter_list());
        let importing = seq(str("IMPORTING"), this.parameter_list());
        let changing = seq(str("CHANGING"), this.parameter_list());
        let receiving = seq(str("RECEIVING"), this.parameter());
        let exceptions = seq(str("EXCEPTIONS"), this.parameter_list());
        let long = seq(opt(exporting),
                       opt(importing),
                       opt(changing),
                       opt(receiving),
                       opt(exceptions));

        return re(seq(this.field(),
                      str("("),
                      alt(reg(/.*/), long),
                      str(")")),
                  "method_call");
    }

    public static source(): Combi.Reuse {
        return re(alt(this.constant(),
                      seq(alt(this.field(),
                              this.method_call(),
                              this.field_symbol()),
                          star(seq(this.arrow_or_dash(), this.field())))),
                  "source");
    }

    public static boolean(): Combi.Reuse {
// todo
        return re(star(reg(/.*/)), "boolean");
    }

    public static field(): Combi.Reuse {
        return re(reg(/^\w+$/), "field");
    }

    public static constant(): Combi.Reuse {
        return re(reg(/^(\w+)|('.*')|(`.*`)|(\d+)$/), "constant");
    }
}