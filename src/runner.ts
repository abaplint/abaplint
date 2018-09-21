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
import {Version} from "./version";
import {Downport} from "./downport";
import {Define} from "./statements";
import {MacroCall, Unknown, Statement} from "./statements/statement";
import * as Types from "./types";
import * as Formatters from "./formatters/";
import * as ProgressBar from "progress";

export default class Runner {

  private conf: Config;

  public static version(): string {
    // magic, see build script "version.sh"
    return "{{ VERSION }}";
  }

  public static downport(files: Array<ParsedFile>): Array<File> {
    return Downport.run(files);
  }

  public static types(file: ParsedFile) {
    return Types.Analyze.run(file);
  }

  public static format(issues: Array<Issue>, format?: string): string {
    // todo, this can be done more generic
    // todo, move this somewhere else, this is output
    switch (format) {
      case "total":
        return Formatters.Total.output(issues);
      case "json":
        return Formatters.Json.output(issues);
      case "code":
        return Formatters.Code.output(issues);
      default:
        return Formatters.Standard.output(issues);
    }
  }

  constructor(conf?: Config) {
    this.conf = conf ? conf : Config.getDefault();
  }

  public run(files: Array<File>): Array<Issue> {
    let parsed = this.parse(files);

    parsed = this.fixMacros(parsed);

    return this.issues(parsed);
  }

  public parse(files: Array<File>): Array<ParsedFile> {
    let ret: Array<ParsedFile> = [];

    let bar = undefined;
    if (this.conf.getShowProgress()) {
      bar = new ProgressBar(":percent - Lexing and parsing - :filename",
                            {total: files.length});
    }

    files.forEach((f) => {
      if (!this.skip(f)) {
        if (bar) {
          bar.tick({filename: f.getFilename()});
          bar.render();
        }

        let tokens = Lexer.run(f);
        let statements = Parser.run(tokens, this.conf.getVersion());
        let root = Nesting.run(statements);

        ret.push(new ParsedFile(f, tokens, statements, root));
      }
    });

    return ret;
  }

  public fixMacros(files: Array<ParsedFile>): Array<ParsedFile> {
// todo: copies all statements? (memory)

    let reg = new Registry();

    files.forEach((f) => {
      f.getStatements().forEach((s) => {
        if (s instanceof Define) {
          reg.addMacro(s.getTokens()[1].getStr());
        }
      });
    });

    files.forEach((f) => {
      let statements: Array<Statement> = [];
      f.getStatements().forEach((s) => {
        if (s instanceof Unknown &&
            reg.isMacro(s.getTokens()[0].getStr())) {
          statements.push(new MacroCall(this.tokensToNodes(s.getTokens())));
        } else {
          statements.push(s);
        }
      });
      f.setStatements(statements);
    });

    return files;
  }

  public issues(files: Array<ParsedFile>): Array<Issue> {
    let issues: Array<Issue> = [];

    let bar = undefined;
    if (this.conf.getShowProgress()) {
      bar = new ProgressBar(":percent - Finding Issues - :filename",
                            {total: files.length});
    }

    for (let file of files) {
      if (bar) {
        bar.tick({filename: file.getFilename()});
        bar.render();
      }

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

  private skip(file: File): boolean {
// ignore global exception classes, todo?
    if (/zcx_.*\.clas\.abap$/.test(file.getFilename())) {
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

exports.File = File;
exports.Runner = Runner;
exports.Config = Config;
exports.Version = Version;