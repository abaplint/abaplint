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

* data
DATA lv_foo TYPE i.
DATA lv_foo LIKE LINE OF foo.
DATA lv_foo LIKE lv_foo.
DATA lv_foo TYPE REF TO cl_foobar.
DATA lv_foo TYPE TABLE OF i.
DATA lv_foo TYPE zcl_class=>typedef.
DATA lv_foo LIKE sy-tabix.
data foo type ref to ZCL_FOOBAR.
data foo type ref to ZCL_FOOBAR .
DATA sdf TYPE c ##NEEDED.
Data foo(89) type c.
data foo type char100.
data foo100 type c length 100.
data char.
data char(100).
data sdf type table of ref to zcl_foobar.
data range type range of string.
data: lt_foo type table of bar initial size 0.
data foobar type abap_bool read-only value ABAP_FALSE ##NO_TEXT.
data item(4) value '  # '.

* misc
condense lv_foo.
add 2 to lv_foo.
continue.
rollback work.
clear lv_foo.
assert 1 = 0.
append 'sdf' to lt_foo.
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
