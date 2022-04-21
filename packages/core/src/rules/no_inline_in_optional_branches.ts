import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Structures from "../abap/3_structures/structures";
import * as Expressions from "../abap/2_statements/expressions";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Version} from "../version";

export class NoInlineInOptionalBranchesConf extends BasicRuleConfig {
}

export class NoInlineInOptionalBranches extends ABAPRule {
  private conf = new NoInlineInOptionalBranchesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_inline_in_optional_branches",
      title: "Don't declare inline in optional branches",
      shortDescription: `Don't declare inline in optional branches`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#dont-declare-inline-in-optional-branches

Considered optional branches:
* inside IF/ELSEIF/ELSE
* inside LOOP
* inside WHILE
* inside CASE/WHEN, CASE TYPE OF
* inside DO
* inside SELECT loops

Not considered optional branches:
* TRY/CATCH/CLEANUP`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoInlineInOptionalBranchesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const output: Issue[] = [];

    const version = this.reg.getConfig().getVersion();
    if (version === Version.v700
        || version === Version.v702
        || version === Version.OpenABAP) {
      return [];
    }

    const struc = file.getStructure();
    if (struc === undefined) {
      return []; // syntax error
    }

    const candidates = [
      ...struc.findAllStructures(Structures.If),
      ...struc.findAllStructures(Structures.Loop),
      ...struc.findAllStructures(Structures.While),
      ...struc.findAllStructures(Structures.Case),
      ...struc.findAllStructures(Structures.CaseType),
      ...struc.findAllStructures(Structures.Do),
      ...struc.findAllStructures(Structures.Select)];

    for (const c of candidates) {
      const inline = c.findFirstExpression(Expressions.InlineData);
      if (inline) {
        const message = "Don't declare inline in optional branches";
        const issue = Issue.atToken(file, inline.getFirstToken(), message, this.getMetadata().key, this.getConfig().severity);
        output.push(issue);
      }
    }

    return output;
  }

}