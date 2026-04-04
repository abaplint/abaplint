import { IFile } from "../../files/_ifile";
import { Position } from "../../position";
import { IABAPLexerResult } from "./lexer_result";
export declare class Lexer {
    private virtual;
    private tokens;
    private m;
    private stream;
    private buffer;
    run(file: IFile, virtual?: Position): IABAPLexerResult;
    private add;
    private process;
}
