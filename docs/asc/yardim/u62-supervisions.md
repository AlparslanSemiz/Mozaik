# Supervisions

aSc Timetables yardım belgelerinden alındı (9 konu).
Üreten: `node scripts/asc-yardim.mjs`

---

## What is room supervision and how to input it?

_u1/u3/u62/t478_

On some schools, children need to be supervised by a teachers during a break times in particular areas of the school (e.g. halls, yard, or canteen). aSc Timetables offers you a set of functions to handle these situations.How to input room supervision?At first, it is necessary to input areas, where the supervisions will take place. You can simply input these areas/rooms as "an ordinary classrooms". See: How to add new classroomIt is important: 
(1) - in dialog "Classroom" select the checkbox "This room requires supervision"
(2) - we recommend you to input also nearby classrooms. This information is helpful during assigning of teachers for supervision - it is better to choose teacher who has been teaching lesson in some nearby classroom before or after supervision time.Notes:
- create rooms exactly according to areas you are supervising. E.g. if one of the hall is "too long" and you divide it to two or more smaller parts to supervise them separately, then create more classrooms and name them accordingly (eg. "Hall 1st floor till 4A classroom", and "Hall 2nd floor after 4A classroom"). 
- All classrooms, which you wish to supervise, you can recognize in the list with all classrooms by special "green triangle" mark. 
- if you wish to supervise an already created classrooms, just edit it in a similar way - check mentioned option for required supervision
The next step is to define supervision times - when exactly each supervision should be. You can do this in a special "Room supervision view. This view will be available only after you select at least one classroom for supervision. 
In this view you will see all classrooms in which you have selected "Room supervision" in classroom dialog.
You can add new supervision simply by clicking on desired position. From the context menu you can choose new supervision during a break (on picture it is the break between 2nd and 3rd period) or during a period (on picture it is on the 3rd period). 
The length of the supervision is done by belltimes. 
How to rename the periods and specify bell times
You can add supervisions for all breaks or periods from context menu after you click on row headers. That is all for creation new supervisions. 
Initially, there will be no teacher assigned for supervisions, so they are shown as a grey squares with question mark in it. For the next steps see following articles: 
Removing supervision
Choosing teachers for room supervision.
Generate room supervision
How can I export duties timetable? (available only in the offline version for Windows)

---

## Removing supervision

_u1/u3/u62/u3139_

You can remove selected supervisions just by clicking it. From menu select the first option Remove room supervision. 
If you wish to remove all created room supervisions in a classroom, you can do so from the context menu (right click on row header).

---

## Choosing teachers for room supervision.

_u1/u3/u62/t482_

Before selecting teachers for supervisions, it is necessary to create all duties in this way: 
What is room supervision and how to input it?Then you can choose a teacher for room supervision by clicking on supervision time in "Room supervision" view.Popup menu will show all teachers available for supervision during this time. Teachers are sorted according the best candidate for the selected supervision. You will see small squares near every name. They inform you about teacher's lessons before (left square) and after (right square) supervision. Their colors indicate this: 
Green - means that teacher is teaching in nearby classroom (in the relation with selected room for supervision)
Blue - means that teacher is teaching in some other classroom (not nearby, so it can be on the totally opposite end of the school's building)
White - means that teacher doesn't teach at all
Red - means that teacher is not suitable candidate for supervision or, he is doing a supervision in some other room at this time. Numbers after teacher's name show how many supervisions has this teacher already assigned (minutes/count). When you move mouse over individual supervisions, you will see the teacher's timetable in preview rows area. This timetable shows in which classroom is the teacher teaching and also all supervisions.
See also:
Generate room supervision

---

## Generate room supervision

_u1/u3/u62/t488_

You can use a specific "duties generator", which we developed directly in the software. 
This generator will try to optimize duty's timetable according to the criteria. These criteria are linked with actual teachers' timetables, so we recommend to generate duties only after your timetable is complete. To start the generator, at first switch to "Room supervisions view". Then click on any supervision you have already set. Choose "Generate" from the popup menu. 
In the new window you can set the weights (priorities) of each criterion by moving a slider in particular row with predefined criterion. 
Red part means that you do not want the situation happen, on the other hand the green part means that such situation is preferable.Note:
A good idea is to check the generated duties in the teacher's view. If you find something you do not like, just change the criteria accordingly and generate new supervisions, or simply change supervising teacher. See also:
Can I define min/max supervisions for the teachers?
Choosing teachers for room supervision.
How can I export duties timetable? (available only in the offline version for Windows)

---

## Is it possible to have two teachers supervising one room?

_u1/u3/u62/t656_

Yes, You can define the number of teachers needed for one duty. Just click on the supervision, from the meanu use Count and select the number. Maximum 5 teachers can be set for one supervision. 
Notes
- please note, that you can specify this different counts for each duty. For example the room reguires two teachers in the morning breaks but in the afternoon only one is needed.
- this option means, that two or more teachers will be supervising same place at the same time. If you wish to specify the exact areas, it is better to create separate "classrooms". See also:
What is room supervision and how to input it?
Removing supervision

---

## Can I define min/max supervisions for the teachers?

_u1/u3/u62/t658_

Yes, in case you need, you can define the limits for supervision for certain teachers. It can be set in teacher's constraints dialog and you can limit the count and/or total minutes of supervision. 
If you do not want to limit teacher, just leave the fields blank.
This feature is usefull, if you use the duties generator, but even if you are assigning teachers for supervisions manually, you can see these limits in the list of teachers (only maximum values). 
You can also check the actual values along with min-max in the menu TimeTable - Statistics :
Note:
The "count" of supervisions has higher priority than "summary lenght of supervisions" (in minutes). It means, that max count of supervisions will be kept, but summary duration can be slighty different (it depends on your bells settings). See also:
How to rename the periods and specify bell times

---

## How can I export duties timetable? (available only in the offline version for Windows)

_u1/u3/u62/t938_

You can export the generated supervisions into the XML file. This feature is available only in the offline version for Windows. 
Use the menu "File - Export - Export Room supervisions". Then program asks you, if you wish to open the file directly in Excel (if it installed on your PC), or you wish to save the new file on your PC. The basic layout of the export looks like follow: 
and the template for this export is located in:
"C:Timetables/template/excelexport/room_supervisions_template.xml"If you wish, you can modify the template and save it under a new_nameroom_supervisions.xml - without the "_template" in the same directory. For the next exports the software will use your modified template.See also: 
How to print room supervision in teacher's and classroom's timetable?

---

## Supervisions in more weeks timetable

_u1/u3/u62/u831_

week, supervision, canteen, 

If you have timetable with more weeks, you can set the teachers supervisions duties in two ways: A: same teachers in every week
In this case, you can simply use default "Weeks merged" view, and then add supervisions as usually. 
B: different teacher in every week
At first, select one specific week (e.g. Week A). Then add new supervisions as usual (via "right click" on required positions, or globally with right click on row header). New supervision will be marked with strip on the left side. 
When you finish with adding all supervisions in the first week, then select second week and add all required supervisions again. Already created supervisions in previous week will not be shown. Same for third and every next week. 
After you add all supervisions in all weeks, you can either add teachers duties manually or generate the duties automatically. 
You can see generated example of duties for three weeks (in "Week separately" view). 
In Hall A - same teacher in every week
In Hall B - different duty with different teacher every week
In Canteen - different teachers on same positions in every week
See also: 
How can I define weeks?

---

## How to print room supervision in teacher's and classroom's timetable?

_u1/u3/u62/t865_

You can print the room supervision in the timetables for the teachers or classrooms.In the menu Print Preview -> Global Settings, you can select if you want to print the room supervisions in individual and/or in summary timetables (it includes also reports "wallpapers"). Note:
- you can customize the texts on cards - their size, possition and font type. Just right click on any room supervision in print preview and make changes in this dialog:
- if you select "print room supervision in color" then the background is filled with teacher's color in the timetables for classrooms and contrary - classroom's color in the timetables for teachers.
