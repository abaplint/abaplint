import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {RuleTag} from "./_irule";
import {EditHelper} from "../edit_helper";
import {DDIC} from "../ddic";

export class LineOnlyPuncConf extends BasicRuleConfig {
  /** Ignore lines with only puncutation in global exception classes */
  public ignoreExceptions: boolean = true;
}

export class LineOnlyPunc extends ABAPRule {

  private conf = new LineOnlyPuncConf();

  public getMetadata() {
    return {
      key: "line_only_punc",
      title: "Line containing only punctuation",
      shortDescription: `Detects lines containing only punctuation.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#close-brackets-at-line-end
https://docs.abapopenchecks.org/checks/16/`,
      tags: [RuleTag.Styleguide, RuleTag.Quickfix],
    };
  }

  private getMessage(): string {
    return "A line cannot contain only \".\" or \").\"";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LineOnlyPuncConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: IObject) {
    const issues: Issue[] = [];

    const ddic = new DDIC(this.reg);

    if (obj instanceof Class) {
      const definition = obj.getClassDefinition();
      if (definition === undefined) {
        return [];
      } else if (this.conf.ignoreExceptions && ddic.isException(definition, obj)) {
        return [];
      }
    }

    const rows = file.getRawRows();
    const reg = new RegExp("^\\)?\\. *(\\\".*)?$");

    for (let i = 0; i < rows.length; i++) {
      if (reg.exec(rows[i].trim())) {
        const column = rows[i].indexOf(")") >= 0 ? rows[i].indexOf(")") + 1 : rows[i].indexOf(".") + 1;
        const position = new Position(i + 1, column);

        // merge punc into previous row
        let rowContent = rows[i].trim();
        // if reported row contains a paranthesis, prefix with space if needed
        if (rowContent.length > 1 && !rows[i - 1].endsWith(" ") && !rows[i - 1].endsWith(" \r")) {
          rowContent = " " + rowContent;
        }
        let offset = 0;
        if (rows[i - 1].endsWith("\r")) {
          offset = -1;
        }
        const startPos = new Position(i, rows[i - 1].length + 1 + offset);
        const endPos = new Position(i + 1, rows[i].length + 1);
        const fix = EditHelper.replaceRange(file, startPos, endPos, rowContent);

        const issue = Issue.atPosition(file, position, this.getMessage(), this.getMetadata().key, this.conf.severity, fix);
        issues.push(issue);
      }
    }

    return issues;
  }

}