import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../abap/abap_file";

export class OmitReceivingConf extends BasicRuleConfig {
}

export class OmitReceiving extends ABAPRule {
  private conf = new OmitReceivingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "omit_receiving",
      title: "Omit RECEIVING",
      shortDescription: `Omit RECEIVING`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#omit-receiving`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile],
      badExample: `
      upload_pack(
        EXPORTING
          io_client       = lo_client
          iv_url          = iv_url
          iv_deepen_level = iv_deepen_level
          it_hashes       = lt_hashes
        RECEIVING
          rt_objects      = et_objects ).`,
      goodExample: `
      et_objects = upload_pack(
        io_client       = lo_client
        iv_url          = iv_url
        iv_deepen_level = iv_deepen_level
        it_hashes       = lt_hashes ).`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: OmitReceivingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const e of file.getStructure()?.findAllExpressions(Expressions.MethodCallParam) || []) {
      const p = e.findDirectExpression(Expressions.MethodParameters);
      if (p === undefined) {
        continue;
      }

      const r = p.findDirectTokenByText("RECEIVING");
      if (r === undefined) {
        continue;
      }
      const ex = p.findDirectTokenByText("EXCEPTIONS");
      if (ex !== undefined) {
        continue;
      }

      issues.push(Issue.atToken(file, r, "Omit RECEIVING", this.getMetadata().key, this.getConfig().severity));
    }

    return issues;
  }

}
