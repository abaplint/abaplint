import {CallTransactionAuthorityCheck} from "../../src/rules/call_transaction_authority_check";
import {testRule} from "./_utils";

const tests = [
  {abap: "CALL TRANSACTION 'ZFOO' WITH AUTHORITY-CHECK.", cnt: 0},
  {abap: "CALL TRANSACTION 'ZFOO' WITHOUT AUTHORITY-CHECK.", cnt: 1},
  {abap: "CALL TRANSACTION 'ZFOO' AND SKIP FIRST SCREEN.", cnt: 1},
];

testRule(tests, CallTransactionAuthorityCheck);