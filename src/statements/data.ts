import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Data extends Statement {

    constructor(tokens: Array<Token>, private name: string) {
        super(tokens);
    }

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^(CLASS-)?DATA /.test(str)) {
            return new Data(tokens, "foo");
/*
    str.start().match("CLASS-DATA").match("DATA");
    if(!str.matched()) {
        return undefined;
    }
    str.match_var();
    str.start().match("TYPE").match("LIKE").match("LIKE LINE OF").match("TYPE REF TO");
    if(str.matched()) {
        str.match_type();
    } else {
        str.start().match("TYPE TABLE OF").match("TYPE STANDARD TABLE OF");
    }


            let foo = /^(CLASS-)?DATA /.exec(str);
            console.dir(foo);
            console.dir(str.substr(foo[0].length));

            let match = /^(CLASS-)?DATA (\w+) (TYPE|LIKE|LIKE LINE OF|TYPE REF TO) ([\w=>-]+)[.,]$/.exec(str);
            if (!!match) {
                return new Data(tokens, "foo");
            }
            match = /^(CLASS-)?DATA (\w+) (TYPE TABLE OF|TYPE STANDARD TABLE OF) ([\w=>-]+)[.,]$/.exec(str);
            if (!!match) {
                return new Data(tokens, "foo");
            }

            console.dir(str);
*/
        }
        return undefined;
    }

}