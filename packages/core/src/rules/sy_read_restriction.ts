import {Issue} from "../issue";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {LanguageVersion} from "../version";
import {Severity} from "../severity";

// ABAP Cloud: 17 system fields allowed for reading
// https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENSYSTEM_FIELDS.html
const CLOUD_ALLOWED = new Set([
  "SY-BATCH",
  "SY-DBCNT",
  "SY-FDPOS",
  "SY-INDEX",
  "SY-LANGU",
  "SY-MANDT",
  "SY-MSGID",
  "SY-MSGNO",
  "SY-MSGTY",
  "SY-MSGV1",
  "SY-MSGV2",
  "SY-MSGV3",
  "SY-MSGV4",
  "SY-SUBRC",
  "SY-SYSID",
  "SY-TABIX",
  "SY-UNAME",
]);

// ABAP for Key Users: 5 system fields allowed for reading
const KEYUSER_ALLOWED = new Set([
  "SY-DBCNT",
  "SY-FDPOS",
  "SY-INDEX",
  "SY-SUBRC",
  "SY-TABIX",
]);

export class SyReadRestrictionConf extends BasicRuleConfig {
}

export class SyReadRestriction extends ABAPRule {

  private conf = new SyReadRestrictionConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "sy_read_restriction",
      title: "SY field read restriction",
      shortDescription: `Finds reads of SY fields not allowed in the current language version`,
      extendedInformation:
        `In ABAP Cloud, only 17 system fields may be read; reads of other fields produce a warning.\n` +
        `In ABAP for Key Users, only 5 system fields may be read:\n` +
        `SY-DBCNT, SY-FDPOS, SY-INDEX, SY-SUBRC, SY-TABIX.\n` +
        `https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENSYSTEM_FIELDS.html`,
      tags: [RuleTag.SingleFile],
      badExample: `lv = sy-uname.`,
      goodExample: `IF sy-subrc = 0. ENDIF.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SyReadRestrictionConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _obj: ABAPObject) {
    const issues: Issue[] = [];

    const langVer = this.reg.getConfig().getLanguageVersion();
    if (langVer === LanguageVersion.Normal) {
      return [];
    }

    const allowed = langVer === LanguageVersion.KeyUser ? KEYUSER_ALLOWED : CLOUD_ALLOWED;
    const severity = langVer === LanguageVersion.KeyUser ? this.conf.severity : Severity.Warning;

    // Collect tokens that appear in writable Target positions — they're modifications,
    // handled by the sy_modification rule, not this one.
    const writeTokens = new Set<unknown>();
    for (const t of file.getStructure()?.findAllExpressionsRecursive(Expressions.Target) || []) {
      const concat = t.concatTokens().toUpperCase();
      if (!concat.startsWith("SY-")) {
        continue;
      }
      writeTokens.add(t.getFirstToken());
    }

    // Walk all tokens looking for the sequence  SY  -  <fieldname>
    const tokens = file.getTokens();
    for (let i = 0; i + 2 < tokens.length; i++) {
      const sy = tokens[i];
      const dash = tokens[i + 1];
      const fld = tokens[i + 2];
      if (sy.getStr().toUpperCase() !== "SY") {
        continue;
      }
      if (dash.getStr() !== "-") {
        continue;
      }
      // Adjacent: no whitespace between the three tokens, on the same row
      if (sy.getEnd().getCol() !== dash.getStart().getCol()
          || dash.getEnd().getCol() !== fld.getStart().getCol()
          || sy.getRow() !== dash.getRow()
          || dash.getRow() !== fld.getRow()) {
        continue;
      }
      if (writeTokens.has(sy)) {
        continue;
      }
      const fieldName = "SY-" + fld.getStr().toUpperCase();
      if (!allowed.has(fieldName)) {
        const message = `SY field "${fieldName}" cannot be read in language version ${langVer}`;
        issues.push(Issue.atToken(file, sy, message, this.getMetadata().key, severity));
      }
    }

    return issues;
  }

}
