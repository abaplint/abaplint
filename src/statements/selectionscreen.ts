import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Selectionscreen extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^SELECTION-SCREEN /.test(str)) {
            return new Selectionscreen(tokens);
        }
        return undefined;
    }

}