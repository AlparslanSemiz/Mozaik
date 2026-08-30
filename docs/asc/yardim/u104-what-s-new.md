# What's new

aSc Timetables yardım belgelerinden alındı (21 konu).
Üreten: `node scripts/asc-yardim.mjs`

---

## What’s new in ASC Timetables version 2027

_u1/u3/u104/u8985_

AI integration
The software includes a powerful AI panel where users can communicate naturally and manage their timetable using everyday language. You can simply describe what you want, and the AI understands your intent — whether it is creating new lessons, editing existing ones, or performing bulk changes across the timetable.The AI can also analyze the timetable itself. It understands timetable validation rules and can explain which conditions or constraints were violated and why. Users can ask questions about conflicts, missing requirements, teacher availability, room usage, or scheduling rules in a conversational way.Beyond answering questions, the AI can actively work with the timetable. It can:
- add new lessons,
- modify existing lessons,
- perform mass updates and bulk edits,
- rename or move lessons,
- adjust schedules based on requested conditions,
- help resolve timetable conflicts automatically.
This feature is currently available only in selected regions, with rollout to additional regions planned soon.
New card relationship - "Max consecutive periods per day (extended)" (#84) 
This constraint extends timetable optimization options by allowing the maximum number of consecutive lessons to be enforced only when the daily lesson count exceeds a specified threshold (the second parameter).For example, if you set a maximum of 3 consecutive lessons and a threshold of 6 lessons per day, the program will enforce this limit only on days when a teacher has more than 6 lessons scheduled. Days with fewer lessons will be ignored for this constraint.This allows the timetable to remain compact on lighter days while creating breaks (gaps) primarily on heavily loaded days.
New card relationship - "Max buildings changes per day" (#85) 
This setting limits the number of times a class or teacher can move between buildings during a single day.It is particularly useful in schools with multiple buildings or campuses, where frequent transfers can be time-consuming and inconvenient. By reducing the number of building changes, the timetable becomes more comfortable for both teachers and students and provides more time for moving between lessons.For example, if you set the limit to 1, the program will try to arrange the timetable so that a class or teacher changes buildings at most once during the day.
Multibells timetables - automatic teacher's collision checking
This feature helps detect scheduling conflicts in schools that use multiple bell schedules.When a teacher teaches classes assigned to different bell schedules, lesson periods may overlap in real time even though they appear to occupy different timetable positions. When enabled, the program automatically evaluates the actual start and end times of lessons according to the configured bell schedules and warns about any overlapping lessons assigned to the same teacher.This helps prevent situations where a teacher is scheduled to teach multiple lessons at the same time.
TT online - The Bell Schedule Preview Window
The new feature provides a graphical overview of all bell schedules defined in the timetable, including their actual periods time intervals.You can switch between individual bell schedules or display all schedules simultaneously. The view can also be filtered by specific days or configured to display the entire week.Each period is displayed according to its real start and end time. When hovering over a period, the system immediately evaluates and highlights any overlapping periods, making conflict analysis significantly easier in timetables that use multiple bell schedules.Selecting a period opens a detailed information panel where the period can be reviewed, analyzed, and edited directly. This allows users to investigate conflicts and make adjustments without switching to another timetable view.
TT online - new view "Individual timetables"
This special view is designed to simplify manual timetable adjustments. For example for lower grades in primary school, it may be easier to swap painting and drawing lesson then to input constraint.Instead of displaying all classes, teachers, or classrooms in a large shared grid, each timetable is shown separately in a compact format that closely resembles its printed version. This makes it easier to review schedules from the perspective of a specific class, teacher, classroom, or student and quickly identify areas that may require additional changes.All editing features available in the standard timetable views are also available here. Lessons can be moved, swapped, copied, or modified in the same way as in the regular timetable editor, while all timetable constraints and conflict checks continue to be applied.
TT online - Quick add functions 
When this option is enabled, a small Quick Add button is displayed under the lists of classes, teachers, subjects, classrooms, and other timetable objects.This feature is particularly useful when creating lessons or editing timetable data. If you discover that a required object is missing, you do not need to close the current window and interrupt your work. Instead, you can create the missing object directly from the current screen and immediately continue with the task you were working on.This significantly speeds up data entry and makes timetable creation more convenient by reducing unnecessary navigation between windows.
TT online - Bulk renaming groups feature
This tool allows you to rename multiple groups from different classes in a single operation.It is especially useful when importing data or updating naming conventions across the entire timetable, eliminating the need to edit each group individually.
TT online - Advanced functions
The Options → Tools menu now includes several advanced timetable editing functions previously available only in the desktop version.These functions include Swap Days, Move Lessons, Swap Periods, and Delete Unplaced Cards. They can be used to perform larger timetable modifications quickly and efficiently without manually editing individual lessons.
TT online - Classrooms prioritization
For every classroom assigned to a lesson, you can specify its priority level: Optimal, Normal, Bad, or Emergency, just like in the desktop version.The timetable generator will prefer higher-priority classrooms whenever possible, while still using lower-priority alternatives when required to find a valid solution. This gives you greater control over classroom allocation and timetable quality.
See also: What's new in Online substitutions

---

## What’s new in ASC Timetables version 2026

_u1/u3/u104/u7875_

Breaks can be used for transfers between buildings.
The aSc TimeTables generator can ensure that teachers have enough time to move between classrooms. If the classrooms are located in different buildings, it was previously possible to specify that a full period was needed for the teacher to transfer between them. In the latest version, you can now instruct the software that longer breaks are sufficient for transfers, while shorter ones do not provide enough time.
See: Some breaks can be used for transfer between buildings
Enhanced classroom capacity counting
If you allow multiple lessons to be scheduled in the same classroom, the software now checks if the capacity is enough to host all the scheduled lessons. This is useful for example when using a single gym for multiple grades, it can accommodate boys from 5A+5B or 5A+5C but not 5B+5C as this last one would be too many kids for that room. Another scenario is exam schedule.
See: Classroom capacities
New card relationship - Max classroom changes per day (#81)
This setting is useful if you want to optimize classroom usage for classes or teachers throughout the day, as it can reduce the total number of room transfers. As a result, it helps minimize hallway crowding caused by students moving between lessons.
New card relationship - There must be at least one A before B in a day (#82)
You can use this setting for example when you don't want certain lessons to be scheduled as the first period of the day (though they can appear as the second or later, but not necessarily as the last). This may be useful if you prefer students not to start the day with a difficult subject, or if the lesson requires some preparation time for both the teacher and the students.
There must be at least one B after A in a day (#83)
A similar setting card relationship, but it works in the opposite way — it ensures that a lesson cannot be scheduled as the last period of the day (there must be at least one lesson following it).Search box
A search box has been added to the upper-left corner. By typing into it, you can quickly find and edit any item in the timetable.
See: Search field - Timetables online
Support for adding assistants' lessons
If you have assistant teachers who are not permanently assigned to specific lessons, but are instead added based on the actual timetable, you can now manage them more easily. You can add an assistant to an existing timetable by simply right-clicking on a selected card and choosing "Quick options" from the context menu. Assistants can be removed the same way — either from a single lesson, from all their lessons, or even all assistants from all lessons of a particular subject.This makes it easy to assign assistants at the beginning of the school year or reassign them every few weeks. There's no need to change the lesson definitions — just add or remove assistants directly on the cards where needed.

---

## What’s new in ASC Timetables version 2025

_u1/u3/u104/u6303_

Advisor was updated
Advisor now checks for multiple new issues in your timetable. This helps you in identifying problems or potential issues before the generation itself. And it also scans for problems in student based timetables. 
Advisor in TimeTables online
Advisor is now available also in the online version, both version have the same functionality.
New cardrelationships
We have added new card relationships for more precise assigning lessons to the classrooms/buildings in multiweeks/terms timetables. Max number of buildings per week
Max number of classrooms per all weeks
Test multiple cardrelationships
You can select and test more cardrelationships at once. The software tries to place all the cards that are affected by these cardrelationships. This is usefull to find out potential problems if multiple cardrelationships collide.
Support for larger screens and higher resolutions
The software shall now better scales on the displays with higher resolutions.

---

## What’s new in ASC Timetables version 2024

_u1/u3/u104/u4743_

TimeTables PC versionNew type of relaxed generation based on importance of constraints
You can now use the new mode of generation „Relaxed based on importance“.. This new mode can be found in "Generate new" dialog:
This new mode of generation does three things differently compared to the classic "generation with relaxation allowed":

- First - It puts much higher priority on placing the cards into the timetable than on satisfying all the constraints.

- Second - To balance the higher likelihood of breaking constraints in order to place all the cards – this mode puts more emphasis on breaking lower importance constraints than constraints of higher importance.

- Third – let's say the teacher doesn’t want to teach in afternoons. In other modes, if the constraint is relaxed, the software doesn’t consider it anymore and the teacher may end up teaching 4 afternoons. In this new mode the software differentiates between 4 afternoons and 1 afternoon. This is represented by the points of each relaxed constraint.
These three things combined shall provide you with a tool that generates timetable with all cards placed in and with as most as possible of the important constraints satisfied.This approach is useful if you cannot generate a timetable without relaxation – if your teachers bombarded you with wishes and it is hard to tell which are realistic or not. Or if you simply do not know why your timetable cannot be generated, the software may provide you with a timetable and based on what constraints have been relaxed you can get a better idea of what is preventing your timetable from being generated.Points in verificationThe verification now shows points. If teacher that doesn’t want to teach in afternoon is teaching 4 afternoons, the verification shows 400 points, if this teacher is teaching 1 afternoon - the verification shows 100 points. If this constraint was defined as high importance – the numbers will be 4000 resp 1000 points. This way you can quickly get a summary of how many times the constraints were relaxed and how important they are. Also - if the software needs to pick between two timetables, the one with less points is considered to be better. So one high importance constraint satisfied is better than 9 afternoons of teachers teaching in.
New mode of improve
Alongside with the new type of relaxed generator, a new Improve feature was added. This new mode of improve can break new constraints – if this can help to satisfy constraint of higher importance. You can see the importance of constraints in the improve dialog in column points. The software will try to find better solutions which are more acceptable, and which have less broken constraints with less points in global.It is however important to note that this improve doesn’t remove cards from timetable. On one hand this is useful – you will still get a full timetable after each step of improve. But it has limitations, sometimes you really need to dig deep and completely redo the timetable in order to fix some broken constraints. In other words, the improve is useful way to polish a created timetable, it is not a replacement of “generation of new timetable”. 
New card relationships
Min free days between lessons (weekend is not considered). (#77) 
Until now you were able to specify, that two lessons can not be placed on two following days. This was sufficient for timetables until 5 days. However, if you use timetable in cycle for more days (e.g. 7) for more precise distribution of the cards in your timetable now you can specify the min gap /in days/ between two lessons. So, in case kids have painting two times per 7 days week, you can specify, that there should be at least two free days between these two lessons. This relation also consider gap in the cycle repetition. So, the software will not place lessons on Day 1 and Day 6 even when there is sufficient gap (4 days) in actual week, because next week in the cycle, there will be just one day (Day1- 4 days - Day6 - 1 day only - Day1 - ...). 
Painting lessons in class must have gap at least 2 free days.
Max different days per week (per all weeks). (#78) 
The new relation can help you to save space for teachers, if they teach different lessons in more weeks timetable and you want to minimize usage of the different days in the week. For example, if you put lessons of some external teacher onto Mon, Wed, Fri in the first week and Tue and Thu in the second week – he basically has to come to your school on each day. If this teacher has other activities - he has each day blocked by you. Instead it is more friendly to put his lessons on Mon, Wed, Fri first week and Mon, Wed second week. This way he will always have Thu and Tue free.
New test for bigger timetables
The test was adjusted to work also with a very big timetables (where it is problem to generate a timetable of one class – for example if the students are joined with many classes). But the test shall still provide fast enough tests on smaller timetables. Fixes
We have fixed couple issues with students timetables. 
Other minor fixes.

---

## What’s new in ASC Timetables version 2023

_u1/u3/u104/u3462_

Faster generator
In aSc TimeTables 2023 we have had a hard look on the longer and more complicated timetables. After thousands of trial generations, we were able to identify improvements that lead to (brutally/unbelievably good) speed up in the generation of these most complicated timetables.
With these improvements in the algorithm - the generator can now much better predict and avoid problems during the generation and the new version can easily generate many timetables that took hours or days in the previous version.If your timetable took few seconds to generation previously, you will most likely not see much change. But for longer generations we have measured up to 200x faster generation of certain types of timetables!These speed improvements are implemented for both PC version and also the timetables online cloud generator.New card relationships#74 - Max days per All weeks
Now you can limit the max days even in a multi week timetables. You can specify, that art lesson's teacher can teach "max 5 days in two weeks timetable" or your 15 English lessons will be distributed into "max 7 days in three weeks timetable". 
Our teachers can teach max 5 days in two weeks timetable
How to distribute lessons in multiple weeks timetable. #75 - Min distance between the lessons
With this relation you can better distribute lessons into your timetable. If you e.g. do not wish to have two language lessons be "very close" in one day, use this relation with min gap 2 periods. 
French and Spanish language lessons can be in one day, but with a gap at least 2 periods#76 - Cards can not follow
This cardrelationship simplifies the input of situations where two lessons can not be consecutively in one day . For example your teacher teaches Math and PE lessons and you want to give them time to change clothes. 
Our teacher teach two different subjects but they need at least one period gap between.#22 - Cards can not follow (in specified order) with gap parameter
We added a gap parameter, with which you can specify distance between two ordered lessons (A and B). You can ask program to never generate "Math right after Physical education" but it can be two periods later or right before PE lessons. 
Math can not be right after PE, but it can be before or at least one period later# 11 - There cannot be lesson in one day in A positions and lesson on the next day in B positions - with gap parameter"With this change you can now distribute lessons in the week better. This is useful specially if you use e.g. 10 days timetable and you wish to specify, that distance between two particular lessons is grater than one full day. New in Timetables onlineAdded quick changes
We have added a quick changes feature after you right click on card in your timetable. 
Custom fields - import - exports
This feature is specific for Timetables online only. It allows you to add new custom fields for objects in your timetable (e.g. specific codes for your subjects, or positions for teachers, ...) and then import them from clipboard and export them to excel table. It also allow you to export list with all columns you display to xls or csv file. 
Extra columns/rows in print layouts 
This feature is available online now too. How can I define Extra columns? Mass operations with lessons
This great feature helps you in cases when you wish to change many lessons with the same parameter.Supervisions - bulk operations
Now you can add/remove all supervisions in one classroom with few clicks. What is room supervision and how to input it?New in SubstitutionJoin classesLongtime substitution of supervisionsTo download latest PC version, please check:
Download & Installation of PC versionTo start using aSc TimeTables online, please check:
How can I get to Timetables online administrationIf you do not have timetables online account created yet:
How can I create my TimeTables online web page?See all timetabling help topics:
TimeTables

---

## What’s new in version 2022

_u1/u3/u104/u2271_

Cloud generator for timetables online is now available.It is super convenient.
Open your timetable, specify how many computers shall work on it and then let it run. You can monitor the progress of the generation in your mobile phone:
You can enjoy spending your time with your kids or fiancé on the beach, while computers somewhere in datacenter will do your work faster.
It is faster
If you work on laptop - these usually have much slower processors then regular server processors.
It is cost effective
You can rent extra computers only for the time you need them. No need to purchase expensive PC that you will be fully using for just a few days per year.
It is clever
On the PC is up to you to decide what parameters will be used for each generation. When the generation finishes you need to decide what next. sometimes you even need to decide when to stop generation if it doesn't look promising . The cloud generator does all these decisions for you. 

All the results.
The cloud generator provides you with all the results it has found during the work on your timetable. You can review them at any time.

See more here: Cloud generatorGenerator speed was improved in the PC version.
The speed was improved by up to 40% in most timetables. Also the default settings were changed for computers to better utilize the computers with 8 or more cores.
New cardrelationship
Max free days between cards per all weeksImproved dialog for cardrelationships
Improved sorting of the cardrelationships and it is possible to put some background colors to keeps them in order. You can also test them separately or in groups, to see if they are giving required results. 

Substitution online available on the mobile phone.
You can now do the full schools substitutions from your mobile phone. If you need to react fast, you can input absent teacher, specify the substitutions and publish the result.

See more here: Substitution in the mobile appThe importance of constraints was made clearer.
If a constraint has multiple subconstraints, it is now clear what is the importance of each subconstraint, also the main list of constraints now shows the importance of the subconstraint that was relaxed. In previous versions it was shown as the importance of the highest subconstraint.
Other small improvements
For example: 
Quick changes now available also for the unplaced cards.
The improvement dialog now shows the importance of the constraints.To download latest PC version, please check:
Download & Installation of PC versionTo start using aSc TimeTables online, please check:
How can I get to Timetables online administrationIf you do not have timetables online account created yet:
How can I create my TimeTables online web page?See all timetabling help topics:
TimeTables

---

## What’s new in version 2021

_u1/u3/u104/u870_

new version

1. Both online and PC based versions
We are now offering both timetables online and pc based version of aSc TimeTables. You can pick whichever you prefer, the data are compatible so you can switch between the two platforms as you see fit. 

2. Improved verification
The constraints in verification are now grouped by the importance and additional parameters, to let you clearly see how much the current solution is close to your desired state. For example you can see how many teachers have over 5 gaps, which was set as important constraints and how many have over 2 gaps which was set as low importance constraints.

3. Extended tests were improved
The software now checks for more problems in your timetable and it checks for them in better order, if your timetable contains some unsolvable part, the extended tests shall find it faster.

4. New filters in advanced card relationship
The advanced card relationships now have additional filters that can be applied to terms and weeks.

5. Draft generation of teachers constraints was fixed
The draft generation now allows you to relax also the constraints on the teachers, in the previous version they were always strict.6. Better support for lessons that are different lengths in different terms.7. Fixes in the cloud generator.

---

## What’s new in version 2020

_u1/u3/u104/t1296_

Dear aSc TimeTables usersHere is a list of new features in version 20201. The generator got 10-20% faster depending on the actual timetable. Especially the longer generations the bigger benefit.2. Multicore computers. The software uses all the available cores and in this version we have improved the communication between the cores to better utilize the power if your computer. By default the software uses 100% of the power of your PC. We have also added “optimal” setting. This setting will determine the best use of your computer resources while allowing you to still use your PC for other tasks.
3. Cloud generator. The new function cloud generator uses both the power of your computer and our servers in the cloud. This mode is especially useful for timetables where you do not know if they can be generated, what parameters and complexity to use etc. The cloud server will take care of this. It has some experience - collected from generating many different timetables and with this new feature we are trying to put this experience to work and help you with generating your timetable.
4. Endless mode. The cloud generator can also work in new endless mode. If you have hard timetable and time (overnight, weekend) you can let the cloud generator work and when you come back you will see the best result it has found.
5. Extended test was improved. It now has some more tests and the new version fixes couple of issues of the previous version.
6. Advisor can now detect several more fatal problems in your timetables. So that you do not generate the timetable with issues that will certainly prevent the successful generation.
7. TimeTables online. We are constantly improving the online version of aSc TimeTables – it now has more or less all the features that you can find in the windows version. See the list of additions here. For the small changes during the school year – the online version is much more convenient. No need to install it, accessible from anywhere, even your headmaster can use it. For small schools with easier timetable – again the online version might be more useful and practical.
8. Substitutions online. The substitution online is now the preferred way to do the substitutions. It already has more features than the windows version. Plus - it is much safer to use (automatic backups on more computers), you can immediately notify the teachers or students, more people can work at the same time, access from home or any pc in the school etc. See all the new features in the substitutions online here. See also:
What's new in Online substitutions

---

## What’s new in version 2019

_u1/u3/u104/t1286_

What’s new in aSc TimeTables 20191. Room’s now have priorities. For each lesson you can define Optimal, Normal, Bad and even Emergency classrooms:
The software by default tries to put as many rooms as possible into optimal classrooms, then it uses normal rooms. If this is not possible, bad rooms can be used. Putting the lessons into emergency classroom is considered as relaxing the original constraints – so the software will do it only after it was not able to finish the timetable by using better rooms for this lesson. It is also possible to define these rooms priorities for subjects.2. After the generation is finished, the software tries to optimize the rooms in the final timetable once again. 3. Two new cardrelationships were added that allow you to even more precisely specify how you want the rooms allocated in the generated timetable:3A. Max periods per week in emergency classrooms. With this you can try to limit the usage of the emergency classroom, using different apply to you can minimize the global usage of emergency classroom, or make sure that one teacher or one class is not affected more times per week.
3B. Min periods per week in optimal classroom. Same as previous you can make sure the generator puts each class at least once into the optimal room on each day.
4. When manually working with the timetable, the software indicates priorities of classrooms on the right click:
and shows usage of emergency classrooms directly on the card itself.
5. You can change the rooms even in the already generated timetable, you may want to change some optimal rooms to normal – perhaps to further make sure they are used more often. You can then press button “Assign rooms”. Previously this command only assigned the rooms to the cards that were not placed into the classroom yet. Now you also can allow the generator to change classrooms that were already assigned, this may create a better overall rooms assignment:
Of course, you can always use “improve timetable“ option that will try to improve the room usage without disrupting your timetable, or generate a new timetable from scratch – which may be more useful option if you made many changes in the rooms available for various lessons.6. Advanced card relationship “Max periods per day” now has additional setting that specifies number of allowed exceptions. For example you can specify:
Teacher can have max 4 lessons per day - on 3 days per week. On other days he can have more lessons:
Or
Teacher can teach max 5 lessons per day but only on 2 days per week (on all other days he shall have less lessons).
Teacher can teach max 5 lessons per day, but only twice in weekWhat is new in ASC Substitutions software7. Substitutions online now offers a possibility to move the lesson of absent teacher to a different day:
If for example a teacher Fisher is absent, you may move his lesson to some other day so that he do not lose it.
More info8. Substitution online also suggests swaps of lessons - you can swap Fisher's Tuesday lesson with Keat’s Wednesdays lesson – both teachers will teach their subject without changing students study times.
More info9. Or you can move the lesson from Friday afternoon to be done instead of Brown’s original lesson.
More info10. It is now possible to precisely specify if the teacher that is absent on part of the day – for example lessons 3,4 – if this teacher is available to do supervision duties before the 3rd period.
More info11. Long time absences can now be solved in one step, the substitutions online suggest the best teacher that is available to cover most of the lessons of the absent teacher. Your kids will not have 10 different teachers covering one subject in their class.
More info12. Substitutions online sends notifications about each change in the substitutions. You now have a special dialogbox to see/review all the messages it has sent to your teachers:
More info13. Substitutions online now allow the absent teacher to sent instructions to the covering teachers, so that he knows what to do with his students. This way, even when the teacher is absent, his lessons are not lost. The students can still do relevant work. The absent teacher’s doesn’t need to scramble time at the end of the school year to finish all the required topics:
More info14. Your teachers can use their mobile phone to request leave absences. They specify when they want/need to be out of school – your administrator can approve/reject the requests. If the request is approved- that teacher is automatically added to the substitutions online as absent.Also the teacher is notified that his request was approved and can provide notes to the cover teachers what shall be done with the kids while he is out.
More info15. It is now possible to do supervision substitutions:
More info16. Substitutions online now support events. You can define short or multiday events. They will show up in school’s calendar and in the class registers of each teacher, all the participants will get notifications on their mobile phones. The person responsible for substitutions do not need to input this info again into the substitutions – like when and which teachers and classes are out – with one click on the even they can all be added to the substitutions.
17. Teachers can define their own lessons – eg some special few weeks afternoon activities. The substitutions can now substitute these also. If the teacher is out, you will see that the lesson needs to be cancelled or substituted.

---

## What’s new in version 2018

_u1/u3/u104/t1274_

What’s new in aSc TimeTables 2018aSc TimeTables online
Yes, that’s correct - it is now possible to create the timetable from your browser. You can input the data, move cards around, verify, test and even generate the timetables online. All users of yearly maintenance can immediately use this feature. You can switch between online and offline version freely - because the data structure is the same.
What are the main advantages of the online version?Access from anywhere
Just login from any web browser from PC/Mac even iOS/Android tablets. No need to install anything.If you want to create new timetable - use the "First steps" button in upper right corner, and use "Create timetable online" section.
If your Edupage is already created and you have uploaded some timetables - login as admin or as teacher with assigned user rights and use Timetable administration and click on "Timetables Online" button:
Improved versioning & tracking changes
Each time you save the file in the online version a separate copy of your data is created. The software will show you what was changed since the last save and you can revert back to any previous state of your work.
More people can work simultaneously 
Two or more people can input data or move the cards in one timetable simultaneously. You will see who is working together with you.

Better data safety
Your saved timetables are immediately replicated to several servers. With nightly backups - you will never lose your timetable file again. No more USB, shared folders, emails.New timetable viewer for web pages
Timetables share on webpage are now using timetables online viewer. This means that you can display your timetable in the same exact format/cell layouts/ font size as you have defined in aSc TimeTables. Users can view the timetable, print it – or use the updated mobile application to view the timetable.
aSc TimeTables Windows/Mac applicationDoes this mean that my beloved timetables windows/mac application is no longer available and I need to use online version?
Don’t worry: windows/mac version is still available. It is up to you which one will you use. Actually you may even use both to utilize strengths of each one. For example initially you may use online version to let more people input the data. Then you can switch to the application and generate the timetable there. Once the timetable is ready, you can upload it back to online version and then let your headmaster do some small timetable tweaks during the school year in the online version. He or she doesn’t need to contact you every time she wants to move one lesson or just change something in the printouts.Ok, so are there any new features in the aSc Timetables application? Yes:Card relationships can be applied to individual students
It is now possible to define special constraint for just one student. So if for whatever reasons certain student cannot have biology on Wednesday afternoon – you can input it.

New cardrelationships.
We have added several new card relationships that deal with student-teacher assignments. For example you can specify that certain student can be assigned to teacher Einstein or Leibnitz, but not to teacher Newton. Or, you can specify that some students shall have the same teacher for two different courses.

New gap checking options
By default if a teacher (or class,student) has nothing on his 1st period then this 1st period not counted as gap - teacher can come later to the school. In order to have a gap the teacher must have lesson before and after some period without lesson. We have added also an option to count these initial or ending free periods as gaps. New improve mode
It is now possible to ask the software to “generate safely”. If you have already generated a timetable and you want to try to add some constraints, the best way is to generate a new timetable. Why? Because a new constraint might require the algorithm to structure your timetable in a completely different way. So if you can – generate a new timetable. If your timetable generates 10 minutes – add constraints and always generate new timetable. The success rate of adding new constraints is much higher if the software knows before placing the very first card, what you want.So when to use this new safe improve? If you have really complicated timetable that takes long time to generate and you have some wishes that are not very important or realistic. The safe improve will always try to have the timetable in “completed state”. It will not to explore changes that might end up with uncompleted timetable. But because of this limitation, the success rate of incorporating new constraints is lower.

Support of higher resolutions & icons refreshThe software now better supports higher resolutions.
Also the icons were refreshed – design and fashion is evolving so we needed to provide some more modern icons. But since we understand that timetablers use aSc TimeTables to do their work and not to learn new icon fashion each year - the old icons are still available to select ;-)

Bug fixes and smaller improvements
Many smaller fixes,improvements were added over the last year.

---

## What’s new in version 2017

_u1/u3/u104/t1261_

Draft generation
Draft generation was extended to better help you identify possible problems in your timetables. It is now possible to more precisely setup which constraints you want the draft generation to obey, ignore or relax. The constraints for teachers and classes were split into several constraints that can be turned off or on individually.

Extended tests
Now the extended tests can run different tests also on selections based on teachers. So if there is a group of several teachers that can create deadlock in your timetable, the extended tests can identify them.

The advisor was improved
The advisor can now detect several new potential problems in your timetable before the actual generation starts. The Advisor is now able to detect situations where you have fewer resources (teachers, rooms) to cover certain parts of the timetable then necessary. 

New cardrelationships
A new cardrelationship requested by users was added: you can now specify that selected classes have to have at least one(or more) lessons at the same time. So if your Math teachers want to have lesson where they want to give the same exam to more classes or they want to perhaps mix the students, you can easily satisfy them.
Also new “apply to section numbers for each subject“ was added so that you do not need to add one constraint for each subject.Course groups
The course group can now be defined for two sections of the same subject. So you can specify for example that the same teacher can teach section 1 and section 2 of one seminar at the same time. (when for example some students have 5 lessons per week and other students have just 4 lesson per week of the same subject)

Look and feel 
You can now define special screen font color for each object to better distinguish between cards on the screen, select special format for how to print teacher’s name and you can now also define padding and alignment for design objects and texts in timetable cells.Substitution module online 
Over the last year, we have gradually improved the substitution online module. It includes more functions, more customization options and added better integration with events from EduPage.

Quick rooms assignment
You can right click on any card/lesson to quickly add/replace its classrooms. Also in view “classrooms” you can hold Shift and move the card to the row of any room – it will allow that lesson to be placed into that room.

Quick changes
Added more Quick changes. For example possibility to change single lessons into double lessons and reverse.Mobile application
The teachers/students and parents are automatically notified when their timetables or substitution is changed. Also teachers are automatically notified about their substitution duties. The system now sends target push notifications - no need to send SMS or emails.

New EduPage modules:
By purchasing aSc TimeTables you get access to 2 years of EduPage. You can use it to track student’s attendance, input curriculum including teaching plans, input student grades and how they progress in various competencies. You can now use EduPage to let your students pick the courses they want to study next year:

Or you can also organize parent teacher meetings where you or your teachers define when they are available and then parent can book a visit. Various rules can be setup to make sure that each parent can talk to the teacher without any long waiting times: 
Many small fixed and improvements were added and we will continue in improving the software further, so please feel free to tell us any suggestions or comments.

---

## What’s new in version 2016

_u1/u3/u104/t1253_

New Advisor
The new advisor will look at your timetable and list the issues we think that might help you move forward. The software will find and warn you about critical issues that need to be fixed before the generation. But the advisor will also display suggestions to avoid potential problems and to show you how to input certain situations.

New wizard that helps with the setup of the new timetable
We have added new tabs to the initial wizard to help users setup their schedule. It asks some basic questions about your school, and will then customize the software options to better suit your school.

New dialog for managing student’s choices
The revamped dialog will help you in case you want to manually fine-tune individual schedules of students. You can move student to different section or ask the software to provide some suggestions for alternative courses.

New generator options for student based timetables
We have also added new card relationships that will help further with grouping sections. For example teacher can teach two different subjects at the same lesson if there are very few students signed in, or some kids can have more lessons per week of the same course then others etc.Expanded design possibilities.
It is now possible to define more colors, padding, backgrounds for the printouts and more.

Substitution online application now available
The online substitution application runs in browser, so you can use it from any computer/tablet in your school of from home. Also it allows more people to work at the same time. You can decide which application you want to use either online or PC/MAC based aSc Substitutions, both are available.

New modules in the mobile application
The mobile application now handles teaching plans, lesson preparations, the teachers can assign tests, kids do do online tests directly on their mobiles, it is possible to view payments and more.You can download it from:
http://mobile.edupage.orgAnd as usual many smaller fixes and improvements.

---

## What's new in version 2015

_u1/u3/u104/t1211_

Dear usersThank you for your continuing interest and great feedback we receive from you. It is important for us to make the software better. The biggest change in this year’s release is the new timetable generator:Self-modifying generator
When you start the generation of your timetable the software first checks your data, your lessons, your constraints and then in literally generates a low level processor code that is tailored to your timetable. You heard this right: the program that you download from the internet does not generate timetable. Instead it generates the code that will be the best for your actual timetable and then it runs this code. The result is 2x faster generation times comparing to previous year release!

Mobile application was greatly extended
The teachers can now input grades/curriculum into electronic class register. The application works offline, so is great for poor signal classrooms. The students can view homework or exam dates. Parents can view attendance, send electronic absence notes to teachers and much more.

The room supervision can now be defined separately for each week or term
When you define the room supervision while looking at certain week, the software will add room supervision only in that week. If you define it in “merged weeks” view, the supervision will be defined in all weeks:

Course groups for students based timetables
New feature “course groups” lets you group several courses into one entity. So for example when you have 4 students requesting Constitutional law and 2 Students requesting Political science you can tell the software to schedule both with the same teacher into the same room at the same time. Or you can use course groups to make sure certain course pairs are on the same period in different terms. Or tell the software that the groups of students shall be the same for two different courses.

Temporary lessons
You can now add lessons into the timetable by right clicking in teacher’s timetable. These lessons are printed, but when you generate new timetable the software can automatically remove them. This feature is ideal if you need to add some extra duties or preparation time to teachers after the generation and their count depends on the actual timetable.

New printout options
You can remove some lines or print the color in little triangle etc. 

Mandatory substitutions
You can define that for example each teacher needs to have 20 mandatory substitutions per year. While picking the teachers for substitutions the software shows you the balance for each teacher.

And much more 
Many subtle improvements to both web and PC/Mac part of the software were added. We are constantly trying to improve the software so if there is anything do not hesitate to contact us.

---

## What's new in version 2014

_u1/u3/u104/t1187_

Dear usersThank you again for the ongoing support and interest in aSc TimeTables.
This year we have focused mainly on helping you to find the possible problems in the timetable input. To help you find if any particular group of lessons or constraints doesn't prevent successful generation. Besides this we have made the generation faster, added new mobile application and new web features. Here is the list of main additions:1. New feature Analyze by generation

This feature will help you to identify problems in your timetable by showing which cards the generator had the most problems to place. You can use it in case your timetable passes the test, that means the software is able to generate timetables for each individual class, teacher or room but it is not possible to generate the whole timetable. 
See more:
Analyze the timetable by generation2. New feature Analyze by extended tests
The basic test tries to generate single objects. But although if you can generate a timetable for each teacher alone, you may still not be able to generate a timetable for two teachers together. This new feature tries to help you with finding smaller subsets of your timetable that cannot be generated. It is then easier to find what the actual problem is, because you only deal with small part of your timetable. Also this feature not only finds sets of classes/rooms, but it tries also to eliminate constraints or time-offs. So it can tell you that for example certain two teachers cannot be generated together when you consider their time-offs. You will then know there is no problem with other constraints, just 2 teachers and their timeoffs. 
Analyze the timetable by Extended tests3. New feature Draft generation with relaxation
The draft generation was already present in previous versions, but now it also allows you to say that certain set of constraints can be relaxed instead of just turned on/off. Generate draft timetable4. New feature - Native iPhone/iPad and Android application
This application will be available on the Google/iOS store in all countries soon. This is native application, so when you download timetable you no longer need internet connection to view it. If your school uses substitutions each teacher/student that has smartphone will receive automatic notification when the substitution was changed. You do not need to do anything, just publish the timetables and substitutions.
5. New feature Online Substitutions

The Substitution module has been ported to HTML version that can run in your browser from any place. You just need one password and you can do the substitution from any PC at school or home. Or any tablet that has internet access. The software operates the same way as the standalone aSc Substitutions application, you can decide which one you want to use.
Substitution online6. EduPage
You can now build a full webpage around your published timetable. In fact nearly 10'000 schools are using EduPage as their main webpage. Not only for showing timetable & substitution, but also to post news, articles, photos. All wrapped in modern design that can be fully customized. Of course if you do not want, you can just use EduPage to publish timetables and put a link on your main school webpage.
How can I setup EduPage
7. Faster generator.
We have made many optimizations to the generation code. The generation is now 20%-100% depending on the timetable.

---

## What's new in version 2013

_u1/u3/u104/t1096_

As each year, we would like to thank you all our users for the support and interest we receive. There is now hardly a country in the world without aSc TimeTables users.Mac & Linux version
Yes, aSc TimeTables & aSc Substitutions are now available on Mac and Linux systems. You will soon be able to download the instalation for each platform from our main download page. No emulator or windows license is needed. You can of course share your timetables between platforms.
Improved generation speed
The software now generates around 10% faster on the dual/quadcore systems due to improvements in the communication between cores.Room priorities
It is now possible to specify for each lesson the ideal, not-so-best and use-only-in-emergency classrooms. You can exactly specify how many times per week kids can be in the best room, how many times you will tolerate usage of the emergency room:
Optimizing the room usage for students
There are now a few new rules that allow you to reduce the room usage to save on cleaning or rent the rooms:
Reducing the room usageCardrelationships for groups, subjects, teacher's classes
you can now apply all cardrelationships to groups. So for example you can define cardrelatioships that will only affect girls from 5A.Simplified Import from Excel/Clipboard
It shall be now much easier to import basic data as well as lessons into the software. If you are importing lessons/seminars, you no longer need to have the timetable with subjects/teachers, the software can import all the data in one step.
Importing from Clipboard (MS Excel)
also the import of students and selections was simplified:
Import sections from clipboard(Excel) Max teachers on one period
You can now define the maximum number of teachers on certain periods to make sure you have enough free teachers free on each period.
We need two free teachers on each period to make sure we have enough teachers for substitutionsSubjects/courses distribution during the year
You can specify that student has to complete Course A before he can have course B.
Student has to finish Biology before he can attend Biology practice
Also for the multiweek timetables it is now possible to specify that subject has to be on consecutive 4 weeks.
Subject has to be in consecutive weeks/termsImportance of cardrelationships
It is now possible possible to specify the importance also for regular cardrelationships.Importance of constraints
For some constraints you can set the importance directly when you specifying this constraint. So even if you run the generation with relaxation allowed you can specify that this constraint shall not be relaxed. Student group changes
If you allow it, the generator can swith the student to different section between terms.

Other small improvements
Note for each cardrelationship
Copy cardrelationshipWhat's new in aSc Substitutions 2013Generate the substitutions for one day
You can do the substitutions manually one by one as before or you can let the software to do it for you for the whole day. It follows the substitution criteria you have defined previously.
Generate the substitutions for one dayChange collision
While doing the substitution, you can now directly go to the collision substitution and change it.
Substitution collisionsHolidays
You can now mark certain days as holidays. The lessons are automatically cancelled.
HolidaysAdding the timetable
You can now specify the end time when adding timetable.
Change the timetable for specific time onlyPoints
Points are now calculated by week,month and year and the teacher's base contract can be included. 
Using points to balance substitution/contract loadMore situations timetable panel
The software now shows by different color some more situations to help you decide the best teacher for the substitution.
What is shown in the top right corner?Alternative layout
the alternative layout of the substitution report was changed so that it sorts the lines by the teacher. This makes finding the changes for each teacher easier.
What is "Alternative layout"See also:
What's new in version 2012

---

## What's new in version 2012

_u1/u3/u104/t1018_

First of all we would like to thank all the schools using the software for the ongoing trust and feedback we receive. The software is now used in over 150 countries at around 100,000 schools. We are also glad that many schools are already actively using the TimeTables online feature we have added last year. Since December it is possible to view TimeTables published on TimeTables online also on iPhones/Androids. It is also possible to input the daily plans/attendance directly from your smart phone.This year the main changes are focused on the Substitution(Coverage) module, but there are new things in both Timetables and Timetables Online as well. So let’s start with Timetables:What’s new in aSc TimeTables 2012 Faster classrooms assignment.
It was possible also before, but now there is direct way to specify that some rooms are used by certain subjects or teachers:
How can I specify teachers’ home classrooms?
How can I specify default (usual) classrooms for certain subject?Afternoon lessons
It is possible to specify that some lessons can be in the afternoon, means they can be outside of the regular teaching block. This allows the software to put them in the positions that will create gaps for students, you can of course limit how long gaps do you tolerate.
How can I define lessons that can be outside teaching block(in the afternoon)?

TimeTable testing
Testing the timetable now supports also testing of individual students. So the test can now pinpoint if there are some fundamental problems with picks of certain student. The testing was also made faster in some cases.The generator for the student based timetables was improved.
The student based generator works like before, but after it finishes it also automatically tries to improve the result after the generation. 
We have also fixed problems that made the generation sometimes slower on some dualcore notebooks.Lesson capacities
Lesson capacities and student counts can now be displayed on the cards, the software also shows visual warning in case you manually cross the capacity. 
How can I display capacities and students counts on the cards?
What does the stripes on the cards mean?Displaying courses
The default timetable view now can be changed by specifying your school type. For timetables based on student’s picks it can display all courses in one row, or courses in more rows one for each grade.
What happens when I change school type?New card relationships
It is possible to specify for example that teacher shall not have more than 3 consecutive lessons, but he/she may have 2 doubles (4 in total) or that group of students must have certain teacher in elective subjects.What’s new in aSc Substitutions 2012
User interface was redesigned
We liked the old interface for its simplicity, but it was now time to move on. 

We believe the new interface will provide more smooth operation and still be familiar to all users who were already accustomed to the previous version.
Substitutions - Quick overviewSpeed up for bigger schools
While most schools were not affected, there were certain issues that made the software slower in bigger schools. This has been addressed.Adding a new lessons
It is now possible to create new lesson in the substitutions. 
How can I create new lesson in SubstitutionsSubstitution based on the groups
It is now possible to specify that certain group is missing. Not just the whole class. The software also suggests transfers based on the groups now.
How to specify that Class/Group is missing the whole dayLesson with multiple teachers/classrooms
If you have lessons with more teachers, it is now possible to specify exactly which teacher will be affected. In general it is still advised to have the lessons defined in the original timetable by the groups, but if you already have timetable with joined lessons, this will make things clearer.
Lessons with two teachers or two roomsTimeTable assignment overview
New dialog now provides more detailed information about what timetable are you using on which day. You can change the days, weeks, terms here easily. So if your timetable changes a lot over the year, this dialog will be for you.
Today is Monday but our school decided to use wednesdays timetablePrint preview customization
- now shows the font sizes on the fly also with number
How can I change the font sizes in aSc Substitutions
- you can specify what shall happen if certain text is bigger than his space
How can I force the program to automatically clip the texts or make the fonts smaller?What’s new aSc TimeTables online 2012Smartphone support
You can now use IPhone/Androind to view the timetable and substitution information or to input various data directly from your mobile. 
Mobile version of Online TimetablesAttendance
Attendance can now be inputted both from the web and smartphones. The teacher can input the attendance directly on the lesson, classteacher can approve or disapprove anytime later and school administrator can see statistics for the whole school.

How can I check, edit student's attendance?New events:
There is now one unified function called Events that allows you:
Plan exams for students
Teacher can book exam for any class/subject, so that other teachers do not use the same date for important test/exams.
Create new lessons/meetings
You can create one time lesson or event and specify which teachers/classes shall attend it.
Room booking
Teacher can specify he would like to use certain room and if approved the other teachers will see that this room is already occupied.
School eventsBetter reports
The reporting component now allows for more complicated reports with custom designs.

---

## What's new in version 2007

_u1/u3/u104/t623_

Dear aSc TimeTables usersFirst of all we would like to thank you for your ongoing support. The software was already purchased by schools in 98 countries and we are very glad that we still receive many responses, suggestions, praises and comments from all of you. Your trust is very important to us and we try our best to continue improving the software and make your timetabling work easier. This new version is part of this trying and we hope you will like the new features.Printout designs
The new version now allows you to fully customize your printouts. You can add pictures, your school logo or other necessary text:
Details: Print-out designsCustom fields
Custom fields allow you to define any additional information you might need for your teachers, classes, rooms or even the school. You can for example input and then print teacher's position, consultation hours or similar on the timetables.
Details: Custom fieldsPictures for subjects
Nice feature for smaller children
Details: Printing pictures of subjectsLesson Grid
The lesson grid allows you to see all your lessons in one view. You can also create or edit lessons here. For some tasks this feature is extremely helpful.
Details: Lesson grid overviewRoom supervision
You can now manage the supervisions of some school areas during the breaks between lessons.
Details: What is room supervision and how to input it?Dual core generators
The software now natively supports Dual core processors. Most of the new computers will have them and aSc Timetables can use them. Details: Multiprocessor generation (dual-core...)35% faster generator
We have optimized some generator routines and achieved 35% faster generation times with the new version. Other improvements
- you can define lessons without teachers
- classrooms can be home classroom for more classes
- many other small bug fixes and improvements 
- we also plan another update with new Substitutions features in this summer.

---

## What's new in version 2010

_u1/u3/u104/t928_

Timetables online
Timetables online is a web-based extension of the timetabling application. It offers several features that will help you with sharing the timetables, online backups, teachers daily plans, publishing substitution information and more. Everything is secured, hosted on aSc Servers, so that you do not need to maintain your web-server to get these new features.

For a complete description please check this article:
aSc TimeTables Online - FeaturesNew generation mode - Draft

A new generation mode called 'draft' has been added. This can help you in early stages of timetable generation. It allows you to turn off or on whole groups of constraints and try to generate the draft timetable.
Generate draft timetableContext verification and constraints

You can now select one or more objects, for example a few classes and display only the problems in the timetable related to the selected classes. Same for teachers, subjects etc. Similar function was added to display the constraints the software is checking for each object.
Verify just one class/teachers/subjectDistribution per week/per two weeks

We have extended the card distribution per week options. For each subject you can now specify the default behavior. 
Of course you can still input the exact numbers on how many days/how many times per day, by using the card-relationships, however the new default values are much easier to input and shall cover the most situations.
Modifying the default card distribution per week for the subjectBackup/Auto-save
A new backup feature has been added. Whenever you save your file, a copy is saved to local backup storage. Also autosave now backups your work every 30 minutes. You can recover these files in case you accidentally delete your original files. 
Local backupNote: the timetables online also allows you to save documents to online storage hosted by aSc:
How can I save my timetable to online storageA new advanced card-relationship options
New "Apply to" options have been added "Apply to classrooms" a and "Apply to grades". So you can now apply constraints to all classes from one grade or to specify e.g that certain lesson can be just two afternoons per week in Media room and many similar
How to apply constraints to whole gradesImproved export to HTML/Flash
The export to Flash have been extended, now the whole export is in Flash, we are have also polished the behavior in all current web-browsers. Also please remember that the new Timetables online allows you to publish the timetable to servers hosted by aSc in both Flash and pure HTML. You do not need to have and maintain your web-server or to deal with ftp/upload of the exports. This is done automatically.
=How can teacher/student/parent view the timetableExport of rooms supervisions
You can now export the supervisions into customizabled excel document:
How can I export duties timetable? (available only in the offline version for Windows) Password protection
You can now save your timetables protected with password.Other smaller improvements
Besides the above, we have added other impovements like new advanced cardrelationships, grades, better import of student choices, customizabled export of students in seminars and moreSubstitutions:
Change lesson
It is now possible to change any lesson in the substitutions or split it into several sections and do the substitution on these.
=How to split class into two or more groups?Integration with Timetables online
The substitution is fully integrated with timetables online, you can publish the daily substitution for online viewing, the changes are merged into teachers daily timetables/plans, you can send emails/SMS to the teachers doing substitutions.
How can teacher view his/her substitutions
How can I send email/SMS substitution notifications

---

## What’s new in version 2009

_u1/u3/u104/t827_

Full support for student based timetables
The timetable can handle all the tasks needed to build the timetables based on students.The previous version already supported a possibility to input student and their picks. However this new version greatly extends these possibilities. You can also input course priorities, alternate, optional courses etc.So now the software shall help even Universities, US and Canada High schools and all schools that have whole or part of their timetable build up from students picks, usually in higher grades.There are now two version is the software. Standard and PRO. The PRO version has extended generator that can schedule individual students between different sections of the same course during the generation. Right to left in both application and printouts
We have run through the software and made it right to left friendly both on screen and on printouts.

Day A/Day B timetables
Lesson now not only can flow between terms and weeks, it is also possible to specify that a lesson is on the same position each day, a timetable can be the same on Mon.Wed,Fri etc.Support for Terms
The timetable now supports possibility to define higher level structure of your school year. For example you can create 4 terms. Then for each lesson you will be able to say in which terms it can take place. So you can define a lesson that has to be in Term1 and Term 2, while another lesson has to be in Term1 or Term 2 or Term3.Improved support for weekly timetables
You can create weekly timetables and the software now allows you to more precisely specify when each lesson shall take place. If you for example say certain lesson shall be on 1st OR 2nd week, the generator can decide this for you during the generation
Note: you can freely combine terms and weeks. So you can have 4 terms timetable and each term can consist of Week A/Week B.New printout toolbar & functions
The print preview section has changed, shall be now more straightforward to customize your printouts. This allow you to quickly define colors, sizes of timetables and new features like Extra columns and headers that can provide your custom information for each row/column in your timetable 
More complex printouts and extended customization
It is now possible to change the layout of your timetable printouts. You can freely decide if periods shall be in rows, days in columns, or terms in columns and periods in rows. If you want a separate paper for each week, or that weeks shall be merged into one paper.Improved verification
The verification now groups the items in case there are many similar problems. You can also sort by teacher/class.
Constrains summary
A new function shows you all the constraints you have inputted so far and that the generator shall maintain during the generationNew window for inputting students and their picks
The window for inputting student’s picks is now reorganized, several features shall allow you for faster input manage the student’s selections.

Renaming periods
You can now rename your periods to your liking and also you can create special breaks that will be then printed into the timetable printouts:
Other improvenets
Like lessons that can be during lunch. new cardrelationships etc. We have also added smaller improvements into UI wherever we though it will make your work easier.

---

## What's new in version 2008

_u1/u3/u104/t673_

Dear aSc TimeTables usersthank you for your support and your interest in our software. aSc TimeTables are now used in 114 countries and we are very glad to receive many praises. We are also grateful for your suggestions as they are necessary for further improvements.So here is the list of this year's additions:1. User interface.
The new version is now nicer, but more importantly it shall be easier to use. We tried to minimize the number of clicks so that you can input and create your timetable faster:
2. Generator
Over the past year we have generated literally millions of schedules and measured the impact of many algorithm improvements on schedules from different countries. As a result the generator is now 53% faster.
3. Dual core and Quad core generator.
Since dual core PC's are more and more available we have checked and fine tuned the generator so that it fully utilizes your computer.4. Printouts
It is now possible to print the lesson grid:See: How to print lessongrid?Also you can print legends below the timetables:These legends can show the list of subjects, teachers or classrooms used in the timetable. They are fully customizable. See: Print legends below timetables5. Imports and exports
The software now features simplified XML import/export. This allows you or the company that supplied you with school management system to easily transfer data to aSc TimeTables. Or to transfer the created timetable back to the school management system. See:
Import from XML
Export to XMLOther notable additions:
- Possibility to change line widths in printouts. How can I set the width of the lines?
- Improved import of students/seminars
- Classroom capacities and group sizes. Classroom capacities
- New advanced card relationships
- Lesson grid now supports more subjects (on more pages)
- Related timetables now show also classrooms
- And as usual many more small improvements.
see also:
What's new in version 2007
and
What's new in aSc Substitutions 2007

---

## What is new in ASC Timetables ONLINE

_u1/u3/u104/u884_

Search field
You can use search field for quick actions: 
See: Search field - Timetables onlineExport to Smartschool system
You can export your published timetable to Smartschool 
See: Export to SmartschoolChange the structure of the printed layouts
Even without entering into print preview. 
See: How to change/reset structure of the printed layouts in TT online? Full names in public timetables
You can display/hide full names in this way: 
How can we display full names of teachers and students in timetables for public?
Draft generation
You can specify exact constraints you wish to disable or relax. Course groups
You can now create groups of courses in students/seminars window. 
Improvements in students courses window
You can switch between weeks and terms to see details in student's seminars lessons. 
Counts of students in each section are displayed on cards.
Longer lessons are no more displayed as single lessons. 
New Administration window with timetable preview
now you can see quick preview with changes you did in your timetable
Students' groups selections
In the "Students" window you can assign individual students into groups you have created in classes divisions. Weekend
You can select the days of the weekend your school (or country) useConnect in timetable online
In ASC Timetables online you can work with your colleagues on the same timetable. Colors on cards
In teacher's edit window you can specify exact colors of texts on printed cardsChange all or filtered lessons at once
You can do global changes in lessons via "Specification - Lessons - Change".
