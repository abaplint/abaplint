REPORT zno_unknown.

* move
lt_foo[] = lt_bar[].
<ls_output>-line+lv_spaces = 2.

* todo, remove this file and move it to /test/statements/*

* misc
assert 1 = 0.
while 1 = 2.
endwhile.
if 1 = 2.
elseif 2 = 3.
else.
endif.
include zinclude.
parameters: p_foo type c.
read table lt_foo index 1 into ls_foo.
tables usr02.
unassign <ls_foo>.
case lv_foo.
  when 'foo'.
  when others.
endcase.
break-point.
do 2 times.
enddo.
free lt_foo.
leave to screen 0.
at first.
try.
endtry.
SCAN ABAP-SOURCE tab1 TOKENS INTO tab2 STATEMENTS INTO tab3.
update asdf from foo.
types: foo type c.
class lcl_foo definition.
endclass.
class lcl_foo implementation.
method foo.
endmethod.
endclass.
check 1 = 2.
commit work.
rollback work.
constants: lv_foo type c value 'a'.
OPEN DATASET foobar FOR OUTPUT.
TRANSFER 'sfd' TO foobar.
submit zfoobar and return.
split lv_foo at space into table lt_foobar.
set bit 2 of lv_foo.
message 'sdf' type 'S'.
FIND FIRST OCCURRENCE OF 'boo' in lv_foo MATCH OFFSET lv_offset.
return.
REPLACE ALL OCCURRENCES OF ';' IN lv_name WITH space.
select * from mara.
endselect.
delete lt_table index 1.
initialization.
select-options: foo for usr02-bname.
at foo.
endat.
static foo type c.
insert 2 into table lt_foobar.
collect lt_table.
start-of-selection.
SYNTAX-CHECK FOR lt_itab MESSAGE lv_mess LINE lv_lin WORD lv_wrd DIRECTORY ENTRY ls_trdir.
ALIASES mo_files FOR lif_object~mo_files.