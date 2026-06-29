import {statementType, statementExpectFail, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "MERGE INTO ztarget AS a USING zsource AS b ON a~kf = b~kf WHEN MATCHED THEN DELETE.",
  "MERGE INTO ztarget AS a USING zsource AS b ON a~kf = b~kf WHEN MATCHED THEN UPDATE ALL.",
  "MERGE INTO ztarget AS a USING zsource AS b ON a~kf = b~kf WHEN MATCHED THEN UPDATE SET c1 = '#'.",
  "MERGE INTO ztarget AS a USING zsource AS b ON a~kf = b~kf WHEN MATCHED THEN UPDATE SET c1 = 'x', c2 = 'y'.",
  "MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN NOT MATCHED THEN INSERT ALL.",
  "MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN NOT MATCHED THEN INSERT ( c1 ) VALUES ( b~c1 ).",
  "MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN NOT MATCHED THEN INSERT ( c1, c2 ) VALUES ( b~c1, b~c2 ).",
  "MERGE INTO ztarget AS a USING zsource AS b ON a~kf = b~kf AND b~kf > 0 WHEN MATCHED THEN UPDATE SET c1 = '#' WHEN NOT MATCHED THEN INSERT ALL.",
  "MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN MATCHED AND a~c1 IS NULL THEN UPDATE ALL.",
  "MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN NOT MATCHED AND b~c1 > 0 THEN INSERT ALL.",
  "MERGE INTO ztarget AS a USING @itab AS it ON a~kf = it~kf WHEN MATCHED THEN DELETE.",
  "MERGE INTO ztarget AS a USING @itab AS it DECLARE CLIENT clnt ON a~kf = it~kf WHEN MATCHED THEN DELETE.",
  "MERGE INTO ztarget USING zsource AS b ON a~kf = b~kf WHEN MATCHED THEN DELETE.",
  "MERGE INTO ztarget AS a USING zsource ON a~kf = b~kf WHEN MATCHED THEN DELETE.",
  "MERGE INTO ztarget AS a USING ( SELECT * FROM zbase ) AS b ON 1 = 1 WHEN MATCHED THEN DELETE.",
  "MERGE INTO ztarget AS a USING zsource AS b WHEN MATCHED THEN DELETE.",
  "MERGE INTO ztarget AS a ON 1 = 1 WHEN MATCHED THEN DELETE.",
  "MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1.",
  "MERGE INTO ztarget AS a.",
  "MERGE INTO ztarget.",
  "MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN MATCHED AND a~c1 = 7 AND b~c2 > 0 THEN DELETE.",
  "MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN MATCHED AND a~c1 IS NOT NULL OR b~c2 = 0 THEN DELETE.",
  "MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN MATCHED THEN DELETE OPTIONS PRIVILEGED ACCESS.",
  "MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN MATCHED THEN DELETE OPTIONS USING CLIENT @lv_mandt.",
  "MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN NOT MATCHED THEN INSERT ALL OPTIONS USING CLIENT @lv_mandt.",
  "MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN MATCHED AND b~c4 = 7 OR b~c4 >= 8 THEN UPDATE ALL.",
  "MERGE INTO ztarget AS a USING zsource AS b ON a~k = b~k WHEN MATCHED THEN UPDATE SET c1 = b~c1, c2 = b~c2, c3 = 1 + CASE WHEN b~c4 = 9 THEN 2 * b~c4 ELSE b~c4 END.",
  "MERGE INTO ztarget AS a USING zsource AS b ON a~k = b~k WHEN NOT MATCHED THEN INSERT ( c1, c2, c3 ) VALUES ( b~c1, b~c2, 1 + CASE WHEN b~c4 = 7 THEN 2 * b~c4 ELSE b~c4 END ).",
  "merge into ztarget as a using zsource as b on a~kf = b~kf when matched then delete.",
  "MERGE (lv_dynamic).",
];

statementType(tests, "MERGE", Statements.MergeDatabase);

const semanticFail = [
  "MERGE INTO ztarget AS a USING @itab ON 1 = 1 WHEN MATCHED THEN DELETE.",
  "MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN NOT MATCHED THEN INSERT ALL WHEN MATCHED THEN DELETE.",
];

statementExpectFail(semanticFail, "MERGE semantic restrictions");

const versionsFail = [
  {abap: `MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN MATCHED THEN DELETE.`, rel: Release.v816},
  {abap: `MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN MATCHED THEN DELETE.`, rel: Release.v758},
];

statementVersionFail(versionsFail, "MERGE before v917");

const keyUserFail = [
  {abap: `MERGE INTO ztarget AS a USING zsource AS b ON 1 = 1 WHEN MATCHED THEN DELETE.`,
    rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(keyUserFail, "MERGE not in KeyUser");

