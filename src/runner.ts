import * as Tokens from "./tokens/";
import {File, ParsedFile} from "./file";
import Config from "./config";
import * as Rules from "./rules/";
import {Issue} from "./issue";
import Registry from "./registry";
import {TokenNode} from "./node";
import {Define} from "./statements";
import {MacroCall, Unknown, Statement} from "./statements/statement";
import * as ProgressBar from "progress";
import {GenericError} from "./rules/";

export default class Runner {

  private conf: Config;
  private reg: Registry;
  private files: Array<File>;
  private parsed: Array<ParsedFile>;
  private generic: Array<Issue>;

  public static version(): string {
    // magic, see build script "version.sh"
    return "{{ VERSION }}";
  }

  constructor(files: Array<File>, conf?: Config) {
    this.conf = conf ? conf : Config.getDefault();
    this.reg = new Registry();
    this.files = files;
    this.parsed = [];
    this.generic = [];
  }

  public parse(): Array<ParsedFile> {
    if (this.parsed.length > 0) {
      return this.parsed;
    }

    this.addToRegistry();

    let objects = this.reg.getABAPObjects();

    let bar = new Progress(this.conf,
                           ":percent - Lexing and parsing - :object",
                           {total: objects.length});

    objects.forEach((obj) => {
      bar.tick({object: obj.getType() + " " + obj.getName()});
      this.parsed = this.parsed.concat(obj.parse(this.conf.getVersion()));
    });

    this.parsed = this.fixMacros(this.parsed);

    return this.parsed;
  }

  public findIssues(): Array<Issue> {
    if (this.parsed.length === 0) {
      this.parse();
    }

    let issues: Array<Issue> = [];
    issues = this.generic.slice(0);

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
      try {
        let obj = this.reg.findOrCreate(f.getObjectName(), f.getObjectType());
        obj.addFile(f);
      } catch (error) {
// todo, this does not respect the configuration
        this.generic.push(new Issue(new GenericError(error), f));
      }
    });
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