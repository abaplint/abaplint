import {SuperfluousValue} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error.", cnt: 0},
  {abap: "WRITE / 'foobar'.", cnt: 0},
  {abap: `DATA(message_entry) = VALUE #( message_table[ msgno = msgno ] ).`, cnt: 1},
  {abap: `DATA(message_entry) = message_table[ msgno = msgno ].`, cnt: 0},
];

testRule(tests, SuperfluousValue);