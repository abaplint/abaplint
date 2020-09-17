import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {EditHelper} from "../edit_helper";
import {IRuleMetadata, RuleTag} from "./_irule";
import {Comment} from "../abap/2_statements/statements/_statement";

export class ForbiddenPseudoAndPragmaConf extends BasicRuleConfig {
  public pseudo: string[] = [];
  public pragmas: string[] = [];
  public ignoreGlobalClassDefinition: boolean = false;
  public ignoreGlobalInterface: boolean = false;
}

export class ForbiddenPseudoAndPragma extends ABAPRule {

  private conf = new ForbiddenPseudoAndPragmaConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "forbidden_pseudo_and_pragma",
      title: "Forbidden pseudo comments and pragma",
      shortDescription: `Checks for unwanted pseudo comments and pragma`,
      tags: [RuleTag.Quickfix],
    };
  }

  public getConfig() {
    if (this.conf.pseudo === undefined) {
      this.conf.pseudo = [];
    }
    if (this.conf.pragmas === undefined) {
      this.conf.pragmas = [];
    }
    return this.conf;
  }

  public setConfig(conf: ForbiddenPseudoAndPragmaConf) {
    this.conf = conf;
  }

  // todo, this method could use some refactoring
  // note that the top loop is on the configuration, which makes the default config run fast
  public runParsed(file: ABAPFile) {
    let skip = false;
    const issues: Issue[] = [];

    for (const p of this.conf.pragmas) {
      for (const s of file.getStatements()) {

        if (this.conf.ignoreGlobalClassDefinition === true) {
          if (s.get() instanceof Statements.ClassDefinition
              && s.findFirstExpression(Expressions.ClassGlobal)) {
            skip = true;
            continue;
          } else if (skip === true && s.get() instanceof Statements.EndClass) {
            skip = false;
            continue;
          }
        }

        if (this.conf.ignoreGlobalInterface === true) {
          if (s.get() instanceof Statements.Interface
              && s.findFirstExpression(Expressions.ClassGlobal)) {
            skip = true;
            continue;
          } else if (skip === true && s.get() instanceof Statements.EndInterface) {
            skip = false;
            continue;
          }
        }

        if (skip === true) {
          continue;
        }

        const list = s.getPragmas();
        const found = list.find((a) => a.getStr().toUpperCase() === p.toUpperCase());
        if (found) {
          const fix = EditHelper.deleteToken(file, found);
          const message = "Forbidden pragma";
          issues.push(Issue.atToken(file, found, message, this.getMetadata().key, this.conf.severity, fix));
        }
      }
    }

    skip = false;

    for (const p of this.conf.pseudo) {
      for (const s of file.getStatements()) {

        if (this.conf.ignoreGlobalClassDefinition === true) {
          if (s.get() instanceof Statements.ClassDefinition
              && s.findFirstExpression(Expressions.ClassGlobal)) {
            skip = true;
            continue;
          } else if (skip === true && s.get() instanceof Statements.EndClass) {
            skip = false;
            continue;
          }
        }

        if (this.conf.ignoreGlobalInterface === true) {
          if (s.get() instanceof Statements.Interface
              && s.findFirstExpression(Expressions.ClassGlobal)) {
            skip = true;
            continue;
          } else if (skip === true && s.get() instanceof Statements.EndInterface) {
            skip = false;
            continue;
          }
        }

        if (skip === true) {
          continue;
        }

        if (!(s.get() instanceof Comment)) {
          continue;
        }

        if (s.concatTokens().toUpperCase().includes(p.toUpperCase())) {
          const fix = EditHelper.deleteStatement(file, s);
          const message = "Forbidden pseudo comment";
          issues.push(Issue.atStatement(file, s, message, this.getMetadata().key, this.conf.severity, fix));
        }
      }
    }

    return issues;
  }

}