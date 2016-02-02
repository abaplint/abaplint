REPORT zno_unknown.

* write
WRITE 'foobar'.
WRITE: 'foobar'.
WRITE: 'foobar', 'bar'.

* direct call method
cl_gui_cfw=>flush( ).
cl_gui_cfw=>flush( ) .

* move
lt_foo[] = lt_bar[].

* add
add 2 to lv_foo.
add zcl_class=>c_diagonal to lo_foo->mode.

* misc
condense lv_foo.
continue.
rollback work.
clear lv_foo.
assert 1 = 0.
concatenate space space into lv_foo.
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
translate lv_foo to upper case.
unassign <ls_foo>.
case lv_foo.
    when 'foo'.
    when others.
endcase.
break-point.
do 2 times.
enddo.
describe lt_foo lines lv_lines.
free lt_foo.
leave to screen 0.
assign component 'asdf' of ls_foo to <foobar>.
at first.
try.
catch zcx_root.
endtry.
SCAN ABAP-SOURCE tab1 TOKENS INTO tab2 STATEMENTS INTO tab3.
shift lv_foo by 2 places left.
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
raise exception type zcx_root.
message 'sdf' type 'S'.
FIND FIRST OCCURRENCE OF 'boo' in lv_foo MATCH OFFSET lv_offset.
FORMAT COLOR COL_GROUP.