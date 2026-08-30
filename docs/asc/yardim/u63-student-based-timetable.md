# Student based timetable

aSc Timetables yardım belgelerinden alındı (18 konu).
Üreten: `node scripts/asc-yardim.mjs`

---

## What are seminar/course lessons for?

_u1/u3/u63/t291_

seminars, courses, students generator

Seminars/Courses are a special lessons dependent on individual student choices. Expression "seminar" or "course" in this case means the group of students specified according their individual requests for the the same subject. So instead of groups from divisions, it is important to know every student's request for (elective) subjects and input them into the software alongside with students names. Then the specific algorithm for individual students timetables checks collisions between lessons according to assignment of students to their seminar lessons and if it is possible switch student to another section of the same course. This way the generator tries to get the best possible results and tries to assign every student to all their selected courses. In most common cases when inputting the lessons it is enough to use just groups, like Boys/Girls or 1st group/2nd group... This way you will avoid needing to input all students into the program and assigning them to the seminar's lessons. Also in cases, when students make choices from predefined options (like art subjects, or language courses), which you wish to be taught always at the same time and not mixed (like "music + English advanced" even if students in these groups are different).
Please, see this: How to input Options - each student needs to select one course from Options1 and one from Options2However, in some more complicated cases, you will need to input lessons as seminars (or courses). Especially for optional subjects, where students choose, which subjects they will attend from the list of available subjects without any other constraint. This kind of situation can be handled by groups if students pick just one subject from the list, but in case they can pick two or more, situation can be so complicated that you will need to use seminars. 
See also:
How to input seminar lessons
How can I input individual students
How can I input students picks
How to create sections of courses for subjects 
Working with Seminar lessons in your timetable.
How to generate timetable with students
The student’s timetable view
Pending students view

---

## How can I input individual students

_u1/u3/u63/t793_

Input the individual students into the timetable only for timetabling purposes and if your timetable is based on students’ choices. Otherwise it is not necessary and you can use the basic class - division - group approach. 
See: How to input Options - each student needs to select one course from Options1 and one from Options2Before adding students, it is necessary to create the classes, because each student must be assigned to exactly one class. 
See: What are classes (grade levels).Then you can input individual students in the main menu Students/Seminar - Add. The dialog with two options will appear.
A. Add one student 
If you choose the first option, the new dialog Student appears. 
Here you can specify - the student’s full name (Last name, First name), select the class/grade the student is assigned to (which you created earlier), and optional information such as email or phone number. If you choose this first option, you can also directly specify all subjects (courses) this student has chosen:
B. Add more students 
The second option displays a dialog where you must specify the Class first and then input the names of all students assigned to this class (one line per student). The order Last name/ First name follows this setting: Configure name format (First name / Last name)Note
Entering the students’ subject choices can be done for multiple students at once in other ways, so this second option may be more convenient and faster.
C. Import
You can also add students using the "Import" function. 
See these two articles for more information: 
Import students' course(seminar) selections from clipboard(Excel) - Method 1
Import students' course(seminar) selections from clipboard(Excel) - Method 2
As a result, you will see a list of all new students that were added or imported. In case you need, you can sort the list by any column by a simple click on its header. To sort the list by multiple columns, hold the Shift key on your keyboard and select a second column (e.g., first sort by class, then by name).
See also:
How can I input students picks
How to create sections of courses for subjects 
How to generate timetable with students
The student’s timetable view
Pending students view

---

## How can I input students picks

_u1/u3/u63/t795_

Before adding students requests you need to: 
- add all students into your timetable - How can I input individual students
- create subjects/courses which students can choose from - How to add a new subjectOnce the above is done you can add all students requests for chosen subjects. This can be done via menu Main - Students/Seminars - Students dialog in these ways:A: Enter requests one-by-one for individual student.
Select the student, click "Edit" button or double click on the row and in the new dialog click "Add". In new dialog "Seminar" select the subject from the list and the importance. If you have already created the groups (sections) for selected seminar and this student's class, then you will be able to also assign student into specific group directly in this step. Confirm with OK. 
B: Enter more/all requests for individual student at once
Use right click in row with student. From context menu click "Add request". 
In the new dialog Selection select all subjects requested by student and confirm with OK.
Note
This method can be used for more students also, if you select them at once with using Shift/Ctrl keys. Then just "right click" in any of the selected rows and specify subjects in the same dialog "Selection" as above. Selected subjects will be assigned to all selected students. C: Enter all students who requested for the same subject
At first change the view to "Subjects in column". Then select students who requested for the same subject (e.g. Biology seminar as on picture below). You can select more students with "Shift/Ctrl" keys in the same way as you are used to do in other software. After your selection is done, then simply right-click in the column with requested subject. In the context menu click on "Add request" button. 
You can see that the subjects students has selected became red. This is indicator, that even if you have said the students has selected the subjects, there are still no seminar lesson (sections) defined for these subjects. 
So now, you can continue here: How to create sections of courses for subjects See also:
I cannot see seminar lessons in class's timetable
Student choices - Importance

---

## How to create sections of courses for subjects

_u1/u3/u63/t797_

You can create seminar's lessons as the ordinary lessons - How to input seminar lessons
However, once you have added all students and inputted all their requests 
How can I input individual students
How can I input students picks
you can create these specific lessons directly from Students/seminars dialog. 

In the right part of the dialog, you will see the list of all subjects. Subjects, which are highlighted with "red" color mean those for which students signed, but you have not created seminar lessons for them yet. 
Do the right click on the subject and from the context menu select "Create section(s) for course:...". The new dialog displays. 
In the dialog you will see how many students have requested for this subject so you can create an appropriate number of sections for this subject. You can specify:A. One or more classes (grades) from which the students can be assigned for this course (subject). If you select more classes, then you will create joined courses. If you want courses to be separate for each grade, use just one class (grade) and then create new sections from the course for another class (grade) again in the same way. 
B. The number of sections for selected course and selected class. You will see the average number of students per section, so you can decide, to how many groups you divide the course. C. The teacher(s) for each section. If you don’t know the teachers for these sections yet, use option "Without teacher" and add teachers later. D. The Count per week - how many times per week each section will have the lesson. Following options E, F are optional and can be add/changed anytime later. 
E. Classrooms - assign classrooms to the new sections. F. Lesson capacity - maximum of the students, which can be assigned to one section. Usually you don't need to specify this parameter (and be very careful with it) because there are global parameters. Note:
- You can change the lessons (courses) setup anytime later in the lessons dialog. See this: Class lessons
- After you create all sections - so it is possible to fulfill all students requests, color of the subject changes to white. Once you start creating sections for courses and maybe trying generate partial timetables, you can observe three colors of students requested subjects. 
- red - means that there is still no section in student's class for this subject (course) and you have to create in a ways as described above
- pink - means that sections are created correctly but student is still not assigned into any section. No problem, you can leave this to generator, which will assign students during generation of your timetable. 
- blue - means that student is already assigned into specific section (you can observe its "number" in the cell). See also:
How to generate timetable with students

---

## How to input seminar lessons

_u1/u3/u63/t293_

Before creating seminar lessons, please see following article to fully understand the main difference between the common lesson (for entire class or group) and the seminar lesson: What are seminar/course lessons for?Note
If you have already added the students and their requests, please see this article for maybe a quicker way of adding seminar lessons: How to create sections of courses for subjects Word "seminar" or "course" in this article means the group of students specified according their individual requests for the the same subject. So instead of groups from divisions, in this case it is important to know every student's request and input them into the software alongside with students names. 
It may seems complicated, but creating the seminar lessons is very easy. 
You can input them in the exactly the same way as an ordinary lessons - see: Adding and Editing a lesson - only difference in this case is to select "Seminar" as a group in the group field. Program then will know, that this specific lessons is linked with students requests and during generation it can assign individual students into this special lesson. 
Seminar lesson joined from multiple classes are inputted in the same way as an ordinary joined classes (with "Joint classes" button), only you have to choose "Seminar" as group for all classes:
Important note: 
- only students from selected class (or classes) can attend the seminar lessons. Please, see this to fully understand what "class" means for ASC Timetables - What are classes (grade levels).Seminar groups
Special situation is when you have two seminar lessons from same subject in one class. Program understands this as that these two lessons are equal. If student attends this subject, it does not matter to which from these two lessons will he belong (but he can belong to only one). This is used usually when many students want to attend one subject, so they need to be divided into groups.For example the following picture defines that there are two groups of mathematics seminar. One can be attended by students from 4A another from students from 4A/4B/4C/4D: Later you will have a possibility for each student to pic one, or the software can assign them for you:

---

## Working with Seminar lessons in your timetable.

_u1/u3/u63/t297_

Working with the seminar cards in your timetables is very similar to the regular cards but there are few differences:The first difference is in the way of displaying the cards. Seminar cards are shown as a horizontal stripes within the row of class.In most of the cases lesson is displyed as one horizontal stripe but in some cases it is shown as more stripes, for example as lesson SPS on the picture is shown as two stripes. These stripes are not accidental, they are distributed in such way so it is clear from the first look which seminar lessons can go together. If the stripes of 2 seminars "fit in" it means that lessons may go together on the same position and if they do not fit in then it means that there is at least one student visiting both seminars and so these seminars can not be at the same time. For example, as you may see on the picture that it is possible to move lesson SPS to previous lesson but not to next one, because lessons INF and SED stand in the way.Tip: It is very usefull to use CTRL-click while working with the seminars. It moves all group together.Another difference when working with seminar lessons is that when you try to place the seminar lesson manually to some position where there is already some other seminar, it can activate Function "Rearranging students in seminar groups

---

## How can I assign students to groups manually

_u1/u3/u63/t957_

The PRO version assigns students to groups during the generation. It can even change the group for student if more gorups are availalbe (unless you lock the students in that group of course)The regular version only assigns the students before the generation then it cannot change the groups.In both cases, you might want just to assign the students into groups, without generation, so that you can see the cards, perhaps play around with them to see how they stack together.In this case, just press this button:Alternativelly:
you can manually assign any student to allowed group.
Select one or more students, then right click on the column with subject you want to assign the students to and then select your group:
Just remember:
1. this distribution might not be optimal. For example if you have two subjects that all students must pick. The software might divide first subject as boys/girls and second as Older/Younger students. Then you will not be able to combine these two subjects. This is very simple issue, things might get more tricky if you account teachers time-offs etc. The PRO version can change the students during the generation so it may find out its good to divide the students into same groups for both subjects.
2. if you are happy with the groups, you can lock them:

---

## Function &quot;Rearranging students in seminar groups

_u1/u3/u63/t299_

Function "Rearranging students in seminar groups

This function is activated when you try to place some seminar card to position where already some seminar cards are placed and the only reason why it is not possible to place card to this position is that some students belonging to this seminar have education at this time. Function will be displayed at the bottom of menu showing collisions when placing the card:If you do not have seminar groups(the same subject taught by more teachers) then the software cannot reaarange anything and this option is grayed.If you activate this function then program will let you place card to this position and meanwhile will rearrange students in seminar groups to avoid collisions. Program rearranges students just between so called seminar groups - seminars where there is more lessons of the same seminar subject. Program will never "sign out" student from some subject neither sign him as a new student. Program also considers locked choices of seminar groups for student (scratched circles in Seminars dialogue).At the same time program tries to keep same number of students in partuicular seminar groups of same subject. This is a very important criteria because number of students in group influences education quality and you don't want to have big differences within one class. 
It is possible to set limits what maximum difference from optimal number of students in group is allowed. This setting is available in Seminar dialog in check box "Advanced". There are two limits - when program warns you only about big differences (standard 10%) and limit when program will not even offer you such a bad solution (standard 30%).

---

## I cannot see seminar lessons in class's timetable

_u1/u3/u63/t309_

This situation happens when there is no student from this class assigned for given seminar. In such case a card "without class" is created and can be placed only into teacher's timetable.

The solution of this situation is either to sign some student from this class to this seminar or erase this lesson from teacher's contract.Note: Similar situation can happen also for seminars where there are joint students from two classes. In such case it may happen that there are students only from one class signed for this seminar and so the card is shown only on this class's timetable. If you wish this card to be shown also in other class's timetable then you need to sign some students from this class to that seminar.

---

## Max students for certain seminar lesson

_u1/u3/u63/t763_

It is possible to input max number of students that can be assigned to given seminar (section). You can input it in "Lesson" dialog in "Lesson capacity" field: Note: you can input both minimum and maximum capacity: if you input 10-20 this means that all solution where there are between 10 and 20 students are considered correct for the generator.
If you input only 20 - then this number indicates maximum. The minimum is calculated as number of students / number of sections +- 10%. This 10% can be specified in the seminar/settings section.It is also possible to input this for all lessons of some subject in subject constraints:Note: Value for subject is used only for lessons where "Lesson capacity" field is left blank. If you input "Lesson capacity" in lesson, then value from subject is ignored for that lesson.

---

## How to generate timetable with students

_u1/u3/u63/t805_

Once you have students and their picks and for each subject you have sections defined, you can try the generation. Just press the red button Generate the timetable:
You have 3 options for the generation:1.Generate whole timetable this will generate both the positions of course, means on which period in which term each section will be placed. And also it will assign the students into the courses. The advantage is that this is not two phase solution, when adding a students into sections, the software might actually move the sections to different position to satisfy more students choices. 2.Generate whole timetable – without students, this will place just the sections into periods and weeks, and for the time, it will not assign the students. So the result is a master timetable, without students assigned yet. However during the generation it uses whatever info it has. If there are students who picked both courses A and B, it will not place these at the same period and many more. So the more students choices you have in, the better the master timetable will come up.3.Generate just the students, this generation will only assign students to the sections. It will not move the sections, so this option is more or less a second step of the previous master timetable generation. This option is good when you for example have already distributed a master timetable to teachers and you cannot change it.Note you can use whatever option in any phase of the generation. Even if you don’t have teachers assigned to some courses, or not all students in, you can generate to see whats going on in your timetable.
We recommend using the 1 and if you can’t use the 1st option. You will get the best master timetable and most students choices when generating both together. It might take longer, but generally the percentage is higher then when you generate first master, then students. Of course, you will may need to use the 3rd option in later stages, when the students choices changed dramatically and you don’t want to change the master timetable. See also:
The student’s timetable view

---

## The student’s timetable view

_u1/u3/u63/t807_

You can select student, at the bottom you will see his pending cards. You can just drag his subjects from bottom or move his current assignments in his row. Note that you can’t actually change the position of the lesson in this view; you only can change the sections where this student belongs:For example you can click on Sean’s lesson 141, he is now in section 3.

Once you pick the software shows you green positions with where this lesson can be placed. In this view it means there are other sections of 141.

We place it to 3rd period. You see on the card he was just transferred into section1. The color has also changed because the color was by teachers. (You can change this color coding)

So this view is usufull for some final tuning. If you by accident remove his from the groups, you will find the cards in the bottom are that shows cards not placed in the timetable. In this view this actually means the students picks that are currently unrealized.See also:
Pending students view

---

## Pending students view

_u1/u3/u63/t809_

This view is basically the same as students view, the only difference is that here you can see only the students that had some picks left out. These students are show in rows, their picks that were not realized, are show bellow:

This view is good for final touchups. You can see the unrealized choices, try to put them in or check the gaps. Sometimes during this work you may find a solution that will perhaps break some constraints the algorithm originally could not or simply find out that don’t have enough sections.

---

## Student can have max 3 gaps per day

_u1/u3/u63/t861_

1. First you need to allow discontinout layout so that the software can create the gaps. By default the software will not create any gap.2. Then you just need to add cardrelationship "Max gaps per day":
Note:
this function works best in the PRO version, because if the software can move the student between parallel sections of the same subject, its easier to fulfill this condition. In standard version the software moves only the cards around with students fixed to their sections.

---

## Printing individual student's timetables

_u1/u3/u63/t969_

You can print the timetable for each student, go to print preview and select report "TimeTable for each Student":
Now the software will print only those seminars(course) that this students has picked.If you have also lessons inputted for groups, then the software will print all groups as it doesn't know which into which group this students belongs. You can specify it here:Note: this is needed only if you are creating timetable based on groups. If you have inputted course&students picks, you obviously do not need to do the above (unless you mixed in also some group based lessons)

---

## How can I display capacities and students counts on the cards?

_u1/u3/u63/t1024_

The software now shows the count of students on cards. Also in lesson grid. It is possible to display also room capacity. So it is possible to see 30/31 or just 30.

---

## Student choices - Importance

_u1/u3/u63/t1088_

For each student's request you can specify the "importance" of this request. During the generation the software then makes sure that student receives the more important subjects while the lower important subjects might even be dropped. You can set the importance for each individual request by right click:
Or you can set the importance to all requests of certain subject. Right click on one or more rows:
Note: To set the importance to ALL request right click on "All subjects".Possible values:Strict - the software has to place this. This selection cannot be relaxad. High - it is important to place this, but in rare cases this can go unrealized. Note: most of the time if you see high importance picks unplaced it is usually because of some problem in the constraints.Normal - shall be placed but can be relaxed more often than High. 
Note: the generator may relax one high importance pick and assign 100 normal onces, instead of relaxing 100 normals just to place one high. Contrary, the generator will relax all the high and normal picks if it is needed to place one strict.Low - same as above, just the software is more likely to relax low importance picks.Optimize - the software doesn't care about these picks at all during the generation. Only after the timetable is completed, the generator tries to place these. No card or student pick is relaxed bacause of these. But since the software doesn't think about these picks in advance it may choose build a timetable in a way that will be very unfriendly for putting these picks at the very end. Alternative - you need to go to student's dialog to specify this one. Basically this course selection is alternative to some other selection. In case the main selection is not possible to realize, the student gets this alternative one.Disabled - the software doens't place these at all.

---

## Student's can select/request courses at our school

_u1/u3/u63/t1231_

Most school do not need to input students in order to create schedule.It is enough to know that lesson is for "boys" from class 5A. The software will know that it can out groups Boys and Girls at the same period - because they do not share students.In this simple example, the teacher is teaching all kids from 6A Biology and boys from 8B physical education. Probably some other teacher will have PE with girls from 8B:
However if your kids can select their own subjects/courses, it is not that clear if two subjects can be at the same time - it depends on whether they have the same student or not.For this purpose the sofware allows you to:1. input individual students 
2. and for each studentyou can input his requests
3. then you can input "lessons/sections"So for example:1. Student John from grade 9 
2. John requests two courses Biology, Chemistry.
3. school defines Biology section with teacher Fleming and another Biology section with theacher Pasteur.During the generation John is assigned to either Fleming or Pasteur. Or to neither if for any reason it is not possible to place his request.The system can handle both aproaches within the same timetable, so no need to decide in advance. You will take care of this later - when defining lessons.For detailed info on how this work, please check:
What are seminar/course lessons for?
