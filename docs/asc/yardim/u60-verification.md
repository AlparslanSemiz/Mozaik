# Verification

aSc Timetables yardım belgelerinden alındı (14 konu).
Üreten: `node scripts/asc-yardim.mjs`

---

## Verification of timetable

_u1/u3/u60/t540_

The aSc TimeTables program allows you to verify the created timetable. You can run verification from the main menu via button Verification. Or you can use shortcut - press space bar. The program shows you the broken or relaxed constraints in your current timetable.
The timetable is grayed. In the lower part you can see a list of errors. Each line shows one error. When you click on any line the affected cards are colorized in the timetable so that you can immediately locate the problem.On the left from these errors you may find some more information about the current error as well as buttons Settings or Help.By clicking on Settings you can see detailed description of particular error and you may correct it right away.

---

## Statistics

_u1/u3/u60/t542_

You can get more information about the timetable by choosing the menu item TimeTable - Statistics:

---

## Class XY contains a window

_u1/u3/u60/t191_

The software calculates when the class MUST have lessons and when it CAN have lessons.By default every student must have a lessons in the MUST section. So the software alerts if there is a group of students that doesn't have lesson in the MUST section. E.g. Monday 4th on the picture:
A window can be created also in the CAN section. If the CAN section is 5-7 and the class has lesson on 7th but not on 6th then 6th is window in the students timetable.You can change the MUST and CAN have section by changing the education block manually and allowing students to come later or leave earlier. See: Education block - allow some classes to come later or to leave school earlier.

---

## Divided cards are placed on too many positions in class XY

_u1/u3/u60/t189_

This problem is closery related to problem Class XY contains a windowProgram automatically counts for every division how many positions can be fully occupied with its lessons.There are some positions in the timetable where all students must have lesson, e.g. because of checking of windows in class's timetable, or because all students must start education at period 1. If you place cards from division on more such positions than can be fully occupied, program reports this error.

---

## Verify just one class/teachers/subject

_u1/u3/u60/t932_

If you want to show problems of just one class or teachers in the current timetable you can right click on its/his row headers and select "Verification".This will show only the problems related to the selected object:

---

## Advisor - Overbooked class/teacher/room

_u1/u3/u60/t1235_

Sometimes it may happen that you defined more lessons per week for one teacher/room or class than you actually have positions per week.This can be either a mistake in input, or misunderstanding of how the software interprets your input.For example, this teacher has to teach 5 periods per week in 10 different classes. In total that is 50 lessons per week. However there are just 5 days each 7 periods. It is clearly not possible to teacher 50 periods per week. Either raise the amount of periods per day or change the contract of this teacher:Another example:
This teacher teaches just 20 lessons per week, but they are double lesson, so in total she has 40 periods per week:Do not forget to check the timeoff - teacher can have 10 periods, but only 5 free slots per week:

---

## Advisor - No lessons for certain period

_u1/u3/u60/t1237_

Sometimes it may happen that the class simply doesn't have a lesson that can be on certain positions.For example this school has forbid all subjects to be on 4th period:
This is however a problem in the default settings where a student cannot have a gap in his/her timetable.Either you have to allow some subjects or you need to block this period also in the timeoff of the class. Then the software will know there is no period at that slot:
Of course this was simple example - it may happen then only certain teachers combined with subjects will result is some period where no lesson can be placed because either teacher or subjects cannot go there.

---

## Advisor - Different number of lessons for groups

_u1/u3/u60/t1239_

Let's have a look at this class:
Boys have 3 Physical education lessons per week, while girls have only 2. Of course this can be perfectly legitimate situation on some schools, but many times it is a mistake in data input and the advisor tries to warn you about this. This was simple example. However, sometimes there are many groups, so it is worth to check this dialog. It shows how many lessons each group has:Please remember that the software can only put lessons for the groups from the same line onto the same period. Thus if one group has 8 lessons and other groups in the same line have 0 lessons - you will need 8 slots where only one group is placed and rest of the kids have nothing to do.This example shows not correctly defined lessons:

Since the software can put only lessons from the same division on one period, it cannot put "boys" and "women" together at the same period, although it was probably the intention. The lessons had to be defined for "girls" so that the software knows these two lessons can be put into the same period.Notes
- you can disable this warning in the advisor if it is ok on your school.See also:
Divisions
Why there are asterisks in total number of lessons for class?

---

## Advisor - Lessons of different length

_u1/u3/u60/t1241_

The software allows you to input double and single lessons of the same subjects.However sometimes it may be preferable to input them all as single lessons. For example if you have 5 lesson per week you may have one double lesson (2+1+1+1) or two double lessons (2+2+1).If both situations are ok for your school, then it is better to leave the decision on the generation. Maybe it will then be possible to find a better schedule if it has more options. This can be especially true if you have many such lessons. Because if you define them all as 2+2+1 - such a timetable might not even exist, but if you allow the software to go for 2+1+1+1 it may find a solution. Once you have a solution, you can try to go back to 2+2+1 for certain subjects where it is more preferable to have double lessons.Please check:
I want to have 1+1+1+2 OR 1+2+2 lessons per week.

---

## Advisor - More lessons than days

_u1/u3/u60/t1243_

If you have 5 days and define, that Math lessons shall be 6 times per week, the software will try to put at least 1 Math lesson on each day.So your lessons will always end up like 1+1+1+1+2.However for some schools this is not exactly what was needed, there can be two problems with this input.1. The software will not try to place Math lessons consecutively. If you require the Math lessons to be placed consecutively, it is better to define the lesson as 4 single lesson and one double lesson.
See:
I want to have Single AND Double lessons of one subject! E.g 1+1+1+22. Second issue can be that you allow more flexibility here. Maybe 2+2+1+1 is also correct solution for your school. But since the software treats 6 always as 1+1+1+1+2 you may be limiting options for the generation.
See:
I want to have 1+1+1+2 OR 1+2+2 lessons per week.

---

## Advisor - Teachers have many blocked days

_u1/u3/u60/t1245_

Many of your teachers have a full day blocked.This of course may be legitimate request and the software can cope with this.However many times if you block different teacher on different days, the timetable may become impossible to generate.Very simple example.Lets say you have small school with 2 classes 1.A and 1.B. Each class has 5 Math, 5 English lessons, 4 Physical Education and one Painting. The Painting lesson is joined so both 1A and 1B have it on the same time.By default the software is setup to put one lesson on each day, so on each day the kids will have one Math, one English and either PE or Painting lesson. The timetable will look like this:
Now the Physical education teachers - Arnold and Christiano are both busy men. Arnold cannot come on Mondays and Christiano on Fridays.Suddenly there is a problem in the timetable. The only way how the timetable could be setup was to have these two at the same days.Now the only solution the software has is to place two Math lessons onto the same day:As we said earlier, the software by default thinks that if you have 5 lessons per week, then you want one on each day.So to solve the above timetable, you will need to tell the software to accept that Math can be two times on the same day. If this is not acceptable at your school, you will need to convince the PE teachers to come on the same days. Or you might allow 4th periods.Since the software cannot decide this for you - you need to tell the software what is acceptable solution on your school.This was an easy example. In real life if you block many teachers on many days, the timetable can get so twisted you will have no idea what can be wrong. In that case, try to unblock teachers' timeoffs that are not essential and try to allow the software to place the two periods on the same day if applicable on your school.See also:
I want to have 1+1+1+2 OR 1+2+2 lessons per week.
Education block - allow some classes to come later or to leave school earlier.

---

## Advisor - special classrooms are not defined

_u1/u3/u60/t1247_

Typical example of this problem:You define that English lesson is divided into two groups. Each group can either stay in the the homeclassroom, or can go to the teacher's room:But when you forget to define the rooms for your teacher, the result is that both groups can only stay in the homeclassroom - in other words these two lessons cannot be on the same period, because they require the same classroom.This might be OK and the timetable may be completed. But many times this is not what you wanted. Especially if all your groups have to stay in home classroom.To fix this you need to either define the special rooms, etther for teacher, or for subject or define shared rooms:Of manually specify the other available classrooms for those lessons:
See also:
What is shared classroom? 
How to assign lessons to classrooms?

---

## Advisor - These teachers have to teach in too many classes at the same time

_u1/u3/u60/t1265_

Typical example of this situation – Let’s say, that we have small school with 9 subjects, 3 classes and 8 teachers.

Then we want to create some free lessons for teachers. It is fine, until we set, that 6 teachers have “time-off” on exact same period (on picture below it is third period on Wednesday). 

It means, that for these three classes, there are only two teachers available for teaching on this period. This situation software evaluates as clearly mistake in inputs.

As solution, we have to check time-offs of all other teachers, then mentioned by advisor on highlighted position, and allow some periods. 
Of course, in real timetable, this is more difficult, as in this example. It need not be only time-offs, but you have to check also other constrains you had created (i.e. maximum periods per day for teachers, constrains forbidding teachers to teach on specific periods, and others).

---

## Blocked part of the day

_u1/u3/u60/t1249_

It is of course possible to block any part of the day to any number of objects in the timetable.However, let's look at this timeoff:
Teacher Einstein can teach the whole week, except for Thursday. But somehow he can teach the 9th lesson on Thursday. In most real life situations this is not what the user wanted to input, so the software reports this as a warning. You can hide it - if Einstein can really teach just that one lessons.Now imagine that Einstein is teaching 5 Math lessons in 1A and 5 Math lessons in 1B. In the default setting the software will try to put one Math lesson per day in each class. This cannot be achieved because on Thursday there is only one free slot for Math in 1A and Math in 1B.If the the whole Thursday was correctly blocked, the software would know that Einstein only has 4 days and will generate two math lessons on one day. So it is worth fixing these little mistakes in timeoffs - they can hurt the generation.This was very easy example. However if you block several half days to more teachers/subjects, it may be very hard to tell why the timetable doesn't generate.In that case it is better, if possible, to leave the decision on the software. You can for example tell the software that teacher shall have only 2 days, but the generator can decide which ones:We have teacher who teaches only 2 days per week and it doesn't matter whichor if you need some free afternoons for your teachers - let the software decide which ones:Each teacher shall have one or two free afternoonThe software allows you to input many similar constraints. In general, initially try to input only the timeoffs for the teachers that are essential. Once you generate initial timetable you can try to please other teachers. But if you input everything at the start, the timetable might not exist and you will not know why.Note:
- on some schools it might be worth considering this:
I want to have 1+1+1+2 OR 1+2+2 lessons per week.
