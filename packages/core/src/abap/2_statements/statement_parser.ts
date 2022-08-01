import * as Statements from "./statements";
import * as Expressions from "./expressions";
import * as Tokens from "../1_lexer/tokens";
import {Version} from "../../version";
import {IFile} from "../../files/_ifile";
import {TokenNode, StatementNode} from "../nodes";
import {ArtifactsABAP} from "../artifacts";
import {Combi} from "./combi";
import {Unknown, Empty, Comment, NativeSQL, IStatement} from "./statements/_statement";
import {IStatementResult} from "./statement_result";
import {Token} from "../1_lexer/tokens/_token";
import {IABAPLexerResult} from "../1_lexer/lexer_result";
import {ExpandMacros} from "./expand_macros";
import {Pragma} from "../1_lexer/tokens";
import {IRegistry} from "../../_iregistry";

export const STATEMENT_MAX_TOKENS = 1000;

class StatementMap {
  private readonly map: {[index: string]: IStatement[]};

  public constructor() {
    this.map = {};

    for (const stat of ArtifactsABAP.getStatements()) {
      const f = stat.getMatcher().first();
      if (f.length === 0) {
        throw new Error("StatementMap, first must have contents");
      }
      for (const first of f) {
        if (this.map[first]) {
          this.map[first].push(stat);
        } else {
          this.map[first] = [stat];
        }
      }
    }
  }

  public lookup(str: string): readonly IStatement[] {
    const res = this.map[str.toUpperCase()];
    if (res === undefined) {
      return [];
    }
    return res;
  }
}

class WorkArea {
  private readonly file: IFile;
  public readonly tokens: readonly Token[];
  public statements: StatementNode[];

  public constructor(file: IFile, tokens: readonly Token[]) {
    this.file = file;
    this.tokens = tokens;
    this.statements = [];
  }

  public addUnknown(pre: Token[], post: Token[], colon: Token | undefined) {
    const st = new StatementNode(new Unknown(), colon);
    st.setChildren(this.tokensToNodes(pre, post));
    this.statements.push(st);
  }

  public toResult(): IStatementResult {
    return {file: this.file, tokens: this.tokens, statements: this.statements};
  }

  private tokensToNodes(tokens1: Token[], tokens2: Token[]): TokenNode[] {
    const ret: TokenNode[] = [];

    for (const t of tokens1) {
      ret.push(new TokenNode(t));
    }
    for (const t of tokens2) {
      ret.push(new TokenNode(t));
    }

    return ret;
  }
}

export class StatementParser {
  private static map: StatementMap;
  private readonly version: Version;
  private readonly reg?: IRegistry;

  public constructor(version: Version, reg?: IRegistry) {
    if (!StatementParser.map) {
      StatementParser.map = new StatementMap();
    }
    this.version = version;
    this.reg = reg;
  }

  /** input is one full object */
  public run(input: readonly IABAPLexerResult[], globalMacros: readonly string[]): IStatementResult[] {
    const macros = new ExpandMacros(globalMacros, this.version, this.reg);

    const wa = input.map(i => new WorkArea(i.file, i.tokens));

    for (const w of wa) {
      this.process(w);
      this.categorize(w);
      macros.find(w.statements);
    }

    for (const w of wa) {
      const res = macros.handleMacros(w.statements);
      w.statements = res.statements;
      if (res.containsUnknown === true) {
        this.lazyUnknown(w);
      }
      this.nativeSQL(w);
    }

    return wa.map(w => w.toResult());
  }

  // todo, refactor, remove method here and only have in WorkArea class
  private tokensToNodes(tokens: readonly Token[]): TokenNode[] {
    const ret: TokenNode[] = [];

    for (const t of tokens) {
      ret.push(new TokenNode(t));
    }

    return ret;
  }

// tries to split Unknown statements by newlines, when adding/writing a new statement
// in an editor, adding the statement terminator is typically the last thing to do
// note: this will not work if the second statement is a macro call, guess this is okay
  private lazyUnknown(wa: WorkArea) {
    const result: StatementNode[] = [];

    for (let statement of wa.statements) {
      // dont use CALL METHOD, when executing lazy, it easily gives a Move for the last statment if lazy logic is evaluated
      if (statement.get() instanceof Unknown
          && statement.concatTokens().toUpperCase().startsWith("CALL METHOD ") === false
          && statement.concatTokens().toUpperCase().startsWith("CALL FUNCTION ") === false) {
        for (const {first, second} of this.buildSplits(statement.getTokens())) {
          if (second.length === 1) {
            continue; // probably punctuation
          }
          const s = this.categorizeStatement(new StatementNode(new Unknown()).setChildren(this.tokensToNodes(second)));
          if (!(s.get() instanceof Unknown)) {
            result.push(new StatementNode(new Unknown()).setChildren(this.tokensToNodes(first)));
            statement = s;
            break;
          }
        }
      }
      result.push(statement);
    }

    wa.statements = result;
  }

  private buildSplits(tokens: readonly Token[]): {first: Token[], second: Token[]}[] {
    const res: {first: Token[], second: Token[]}[] = [];
    const before: Token[] = [];
    let prevRow = tokens[0].getRow();

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].getRow() !== prevRow) {
        res.push({first: [...before], second: [...tokens].splice(i)});
      }
      prevRow = tokens[i].getRow();
      before.push(tokens[i]);
    }

    return res;
  }

  private nativeSQL(wa: WorkArea) {
    let sql = false;

    for (let i = 0; i < wa.statements.length; i++) {
      const statement = wa.statements[i];
      const type = statement.get();
      if (type instanceof Statements.ExecSQL
          || (type instanceof Statements.MethodImplementation && statement.findDirectExpression(Expressions.Language))) {
        sql = true;
      } else if (sql === true) {
        if (type instanceof Statements.EndExec
            || type instanceof Statements.EndMethod) {
          sql = false;
        } else if (!(type instanceof Comment)) {
          wa.statements[i] = new StatementNode(new NativeSQL()).setChildren(this.tokensToNodes(statement.getTokens()));
        }
      }
    }

  }

// for each statement, run statement matchers to figure out which kind of statement it is
  private categorize(wa: WorkArea) {
    const result: StatementNode[] = [];

    for (const statement of wa.statements) {
      result.push(this.categorizeStatement(statement));
    }
    wa.statements = result;
  }

  private categorizeStatement(input: StatementNode) {
    let statement = input;

    const length = input.getChildren().length;
    const lastToken = input.getLastToken();
    const isPunctuation = lastToken instanceof Tokens.Punctuation;

    if (length === 1 && isPunctuation) {
      const tokens = statement.getTokens();
      statement = new StatementNode(new Empty()).setChildren(this.tokensToNodes(tokens));
    } else if (statement.get() instanceof Unknown) {
      if (isPunctuation) {
        statement = this.match(statement);
      } else if (length > STATEMENT_MAX_TOKENS) {
        // if the statement contains more than STATEMENT_MAX_TOKENS tokens, just give up
        statement = input;
      } else if (length === 1 && lastToken instanceof Pragma) {
        statement = new StatementNode(new Empty(), undefined, [lastToken]);
      }
    }

    return statement;
  }

  private removePragma(tokens: readonly Token[]): {tokens: Token[], pragmas: Token[]} {
    const result: Token[] = [];
    const pragmas: Token[] = [];

    // skip the last token as it is the punctuation
    for (let i = 0; i < tokens.length - 1; i++) {
      const t = tokens[i];
      if (t instanceof Tokens.Pragma) {
        pragmas.push(t);
      } else {
        result.push(t);
      }
    }

    return {tokens: result, pragmas: pragmas};
  }

  private match(statement: StatementNode): StatementNode {
    const tokens = statement.getTokens();
    const {tokens: filtered, pragmas} = this.removePragma(tokens);
    if (filtered.length === 0) {
      return new StatementNode(new Empty()).setChildren(this.tokensToNodes(tokens));
    }

    for (const st of StatementParser.map.lookup(filtered[0].getStr())) {
      const match = Combi.run(st.getMatcher(), filtered, this.version);
      if (match) {
        const last = tokens[tokens.length - 1];
        match.push(new TokenNode(last));
        return new StatementNode(st, statement.getColon(), pragmas).setChildren(match);
      }
    }
    // next try the statements without specific keywords
    for (const st of StatementParser.map.lookup("")) {
      const match = Combi.run(st.getMatcher(), filtered, this.version);
      if (match) {
        const last = tokens[tokens.length - 1];
        match.push(new TokenNode(last));
        return new StatementNode(st, statement.getColon(), pragmas).setChildren(match);
      }
    }

    return statement;
  }

// takes care of splitting tokens into statements, also handles chained statements
// statements are split by "," or "."
// additional colons/chaining after the first colon are ignored
  private process(wa: WorkArea) {
    let add: Token[] = [];
    let pre: Token[] = [];
    let colon: Token | undefined = undefined;

    for (const token of wa.tokens) {
      if (token instanceof Tokens.Comment) {
        wa.statements.push(new StatementNode(new Comment()).setChildren(this.tokensToNodes([token])));
        continue;
      }

      add.push(token);

      const str = token.getStr();
      if (str === ".") {
        wa.addUnknown(pre, add, colon);
        add = [];
        pre = [];
        colon = undefined;
      } else if (str === "," && pre.length > 0) {
        wa.addUnknown(pre, add, colon);
        add = [];
      } else if (str === ":" && colon === undefined) {
        colon = token;
        add.pop(); // do not add colon token to statement
        pre.push(...add);
        add = [];
      } else if (str === ":") {
        add.pop(); // do not add colon token to statement
      }
    }

    if (add.length > 0) {
      wa.addUnknown(pre, add, colon);
    }
  }
}