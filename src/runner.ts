import * as Tokens from "./tokens/";
import {File, ParsedFile} from "./file";
import Config from "./config";
import * as Rules from "./rules/";
import Lexer from "./lexer";
import Parser from "./parser";
import {Issue} from "./issue";
import Nesting from "./nesting";
import Registry from "./registry";
import {TokenNode} from "./node";
// import {Version} from "./version";
import {Define} from "./statements";
import {MacroCall, Unknown, Statement} from "./statements/statement";
import * as ProgressBar from "progress";

export default class Runner {

  private conf: Config;
  private reg: Registry;
  private files: Array<File>;
  private parsed: Array<ParsedFile>;

  public static version(): string {
    // magic, see build script "version.sh"
    return "{{ VERSION }}";
  }

  constructor(files: Array<File>, conf?: Config) {
    this.conf = conf ? conf : Config.getDefault();
    this.reg = new Registry();
    this.files = files;
    this.parsed = [];
  }

  public parse(): Array<ParsedFile> {
    if (this.parsed.length > 0) {
      return this.parsed;
    }

    this.addToRegistry();

    let bar = new Progress(this.conf,
                           ":percent - Lexing and parsing - :filename",
                           {total: this.files.length});

    this.files.forEach((f) => {
      bar.tick({filename: f.getFilename()});

      if (!this.skip(f.getFilename())) {
        let tokens = Lexer.run(f);
        let statements = Parser.run(tokens, this.conf.getVersion());
        let root = Nesting.run(statements);

        this.parsed.push(new ParsedFile(f, tokens, statements, root));
      }
    });

    this.parsed = this.fixMacros(this.parsed);

    return this.parsed;
  }

  public findIssues(): Array<Issue> {
    if (this.parsed.length === 0) {
      this.parse();
    }

    let issues: Array<Issue> = [];

    let bar = new Progress(this.conf,
                           ":percent - Finding Issues - :filename",
                           {total: this.parsed.length});

    for (let file of this.parsed) {
      bar.tick({filename: file.getFilename()});

      for (let key in Rules) {
        if (typeof Rules[key] === "function") {
          let rule: Rules.IRule = new Rules[key]();
          if (rule.getKey && this.conf.readByKey(rule.getKey(), "enabled") === true) {
            rule.setConfig(this.conf.readByRule(rule.getKey()));
            issues = issues.concat(rule.run(file));
          }
        }
      }
    }

    return issues;
  }

  private fixMacros(files: Array<ParsedFile>): Array<ParsedFile> {
    files.forEach((f) => {
      f.getStatements().forEach((s) => {
        if (s instanceof Define) {
          this.reg.addMacro(s.getTokens()[1].getStr());
        }
      });
    });

    files.forEach((f) => {
      let statements: Array<Statement> = [];
      f.getStatements().forEach((s) => {
        if (s instanceof Unknown && this.reg.isMacro(s.getTokens()[0].getStr())) {
          statements.push(new MacroCall(this.tokensToNodes(s.getTokens())));
        } else {
          statements.push(s);
        }
      });
      f.setStatements(statements);
    });

    return files;
  }

  private addToRegistry() {
    this.files.forEach((f) => {
      let obj = this.reg.findOrCreate(f.getObjectName(), f.getObjectType());
      obj.addFile(f);
    });
  }

  private skip(filename: string): boolean {
// ignore global exception classes, todo?
// the auto generated classes are crap, move logic to skip into the rules intead
    if (/zcx_.*\.clas\.abap$/.test(filename)) {
      return true;
    }

    if (!/.*\.abap$/.test(filename)) {
      return true;
    }
    return false;
  }

  private tokensToNodes(tokens: Array<Tokens.Token>): Array<TokenNode> {
    let ret: Array<TokenNode> = [];
    tokens.forEach((t) => {ret.push(new TokenNode("Unknown", t)); });
    return ret;
  }
}

class Progress {

  private bar = undefined;

  constructor(conf: Config, text: string, options: any) {
    if (conf.getShowProgress()) {
      this.bar = new ProgressBar(text, options);
    }
  }

  public tick(options: any) {
    if (this.bar) {
      this.bar.tick(options);
      this.bar.render();
    }
  }

}

/*
exports.File = File;
exports.Runner = Runner;
exports.Config = Config;
exports.Version = Version;
*/