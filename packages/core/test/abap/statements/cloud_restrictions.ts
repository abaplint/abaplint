import {statementVersionFail, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const cloud = (abap: string) => ({abap, rel: Release.Newest, langVer: LanguageVersion.Cloud});

// what the table of allowed language elements of the ABAP keyword documentation marks as not allowed in ABAP for Cloud Development
statementVersionFail([
  cloud("WAIT UP TO 1 SECONDS."),
  cloud("WAIT UNTIL foo = bar."),
  cloud("WAIT FOR ASYNCHRONOUS TASKS UNTIL foo = bar."),
  cloud("WAIT FOR MESSAGING CHANNELS UNTIL foo = bar."),
  cloud("GET TIME."),
  cloud("GET TIME FIELD foo."),
  cloud("CONVERT DATE foo INTO INVERTED-DATE bar."),
  cloud("CONVERT INVERTED-DATE foo INTO DATE bar."),
  cloud("AUTHORITY-CHECK OBJECT 'S_TCODE' FOR USER 'X' ID 'TCD' FIELD 'SE38'."),
  cloud("COMMIT CONNECTION default."),
  cloud("ROLLBACK CONNECTION default."),
  cloud("PERFORM foo ON COMMIT."),
  cloud("PERFORM foo ON ROLLBACK."),
  cloud("EXIT FROM SQL."),
  cloud("EXIT FROM STEP-LOOP."),
  cloud("DO 3 TIMES VARYING foo FROM bar NEXT moo."),
], "ABAP for Cloud Development, not allowed");

// the same table marks these as allowed
const allowed = (abap: string, type: any) => statementVersionOk([cloud(abap)], "ABAP for Cloud Development, allowed", type);
allowed("GET TIME STAMP FIELD foo.", Statements.GetTime);
allowed("CONVERT DATE foo TIME bar INTO TIME STAMP moo TIME ZONE zone.", Statements.Convert);
allowed("AUTHORITY-CHECK OBJECT 'S_TCODE' ID 'TCD' FIELD 'SE38'.", Statements.AuthorityCheck);
allowed("COMMIT WORK.", Statements.Commit);
allowed("ROLLBACK WORK.", Statements.Rollback);
allowed("EXIT.", Statements.Exit);
allowed("DO 3 TIMES.", Statements.Do);
