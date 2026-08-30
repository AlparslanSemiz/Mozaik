# Constraints

aSc Timetables yardım belgelerinden alındı (97 konu).
Üreten: `node scripts/asc-yardim.mjs`

---

## Relations - basic overview

_u1/u3/u57/u5471_

In aSc Timetables you can add many constraints which are linked to each individual object - teacher, class, subject or classroom. For more precise outcomes in your timetable you can create card relationships which can be applied to more selected objects at once.In menu Main, click on "Relations" icon. The new dialog appears.
The main menu contains buttons: 
Add - Adds a new basic card relationship. 
Edit - Edits the selected card relationship.
Remove - Removes the selected card relationship.
Advanced - Adds a new advanced card relationship.
Make active - Activates the selected card relationship.
Deactivate - Deactivates the active card relationship.
Up - Moves the selected card relationship up in the list.
Down - Moves the selected card relationship down in the list.
Copy - Creates a copy of the selected card relationship.
Test - Tests one or more selected card relationships.
Color - Changes or assigns a color to the card relationship.
OK Button - Confirms the changes and closes the window.

---

## How to add basic card relationship

_u1/u3/u57/u5467_

Basic card relationships can be added in Relations dialog by clicking on "Add" button. New dialog "New relationship" appears. It is divided into these main parts. 1. Click on "Select subjects" button. New dialog appears and you can select one or more subjects, you wish the new relation will be apply to. This option is mandatory, because with no selected subject the relation will basically do nothing. 2. Select if the relation will be applied to All classes or Selection of classes (click on "Change classes" buton and select classes in a similar way as subjects). Default option is for all classes. 3. Select the card relationship you wish to use. In some cases, there are additional settings or hidden fields appears after selecting the relation. 4. For every relation you can specify its Importance or activate/deactivate it. Note:
As you can see, these "basic" relations try to solve most general situations related to classes and their lessons. Specific situations related to teachers, classrooms you can solve with advanced relations. 
Here are some use cases for every relation you can select in the 3rd part: 

- Two subjects cannot be placed on the same day.
- They cannot be placed consecutively on the same day.
Two subjects cannot follow/Cannot be on the same day.
- card distribution over the week.
I want to have Single AND Double lessons of one subject! E.g 1+1+1+2
Specify how many lessons shall be before certain position
There can be two Math lessons on one day, but they need to be placed consecutively
- Two subjects must be in one day.
- Two subjects must follow. 
Two subjects must follow each other
- Break cannot be between group of lessons.
- Group of cards from different classes must be in one day.
- Divided cards from one subject must be on one day.
- These subjects for the group of listed classes must start at the same time.
- The selected subjects have to be at the same time in all selected classes.
I need subject Math to be on the same position in classes 5.A and 5.B
- This subjects must be on the same period each day.
I want to have Math lessons in a class on the same period every day
- Reserve space for selected subjects.
- Subjects must be first or last.
I need subject Geography to be last lesson on a day in classes 5.A, 5.B, 5.C...
- The selected subjects can be in the afternoon (outside teaching block). 
How can I define lessons that can be outside teaching block(in the afternoon)?
In the last part you can specify the Importance of this relation, activate or deactivate it and add notes.

---

## Windows (gaps) in teachers timetables

_u1/u3/u57/u79/t168_

In many schools, teachers often complain about “windows” in their timetables. Because of these free periods, they have to stay at school with no lessons, and they cannot leave since they have other lessons later.
You can solve these complaints by minimizing teachers’ gaps in the following way:1. Set default values for all teachers
You can limit the total number of windows per teacher per week in the Timetable → Parameters menu.Note:
If windows (gaps) are not a problem at your school, we recommend turning this option off (no gap checking).
2. Set individual values for each teacher
If you need different settings for some teachers, you can define custom limits in the Teachers → [Select Teacher] → Constraints menu.Note:
If this option (4) is disabled for individual teachers, make sure that the global parameter is turned on, as described in step 1.
3. Limit the number of windows per dayThe previous two options check the total number of windows in the whole week.
If you want to limit the number of windows per day, use the checkboxes in the teacher’s details (6).For example, you can allow a maximum of two windows per day.
Even if the teacher is allowed six windows per week, the program will prevent cases such as five windows on one day and one on another.
For simpler timetables, you can also set that the teacher may have at most one window per day using the second checkbox.

---

## We have teacher who teaches only 2 days per week and it doesn't matter which

_u1/u3/u57/u79/t374_

You can use option Teachers - select the teacher - Constraints. Program will then choose the most suitable days within the given number:Note: If you specified days precisely, be careful not to specify other teachers similarly. It may happen that all external teachers want to teach on Tuesday and Thursday. Such timetable criteria with combinations of others might be impossible to meet.Please see also: 
How to set teacher's timeoff
Our teacher must teach in consecutive days

---

## Teacher is teaching 2 lessons per week in class 5A but both are in the afternoon.

_u1/u3/u57/u79/t243_

You instruct the generator to balance the lessons so that if teacher is teaching only two or three lessons in one class they shall not be placed every time late in the day.You have two options:
1. Max one history lesson on 6th-7th position in each class (solution 1)
or 
2. Specify how many lessons shall be before certain position

---

## How to specify min and max lesson teacher shall have on one day?

_u1/u3/u57/u79/t586_

You can do this in teacher's constraints:
Notes:
- you can specify to not to check these values on the Saturdays/Sundays. So the teacher shall have 2 lessons each day on the Monday-Friday, but they can have 0 or 1 on Saturday.- please make sure that you do not require unrealistic demands here. It is strongly recommended to add this and similar requirements later. If it is not possible generate a timetable, it will be even more impossible to generate it with requirement that each teacher shall have 2-5 lessons each day. See: A good way to generate your timetable

---

## We need one free Math teacher for every period in week

_u1/u3/u57/u79/t355_

Let's take a case, when there are 5 Math teachers in your school and you wish to ensure that there always be at least one of these teachers free on every period (e.g. for substitution purposes). You can achieve this with advanced card relationship nb.15 - "Max cards on one period" (use menu - Relations -> Advanced) with following inputs: 
- max 4 cards - because there are 5 teachers and one must be always free (so 5-1=4),
- apply globally - means for all lessons of these teachers (for every class and every subject they can teach), 
- change teachers - specify all these 5 Math teachers
all other settings you can leave to default. See picture:

---

## How could be distributed the first/last lessons for all teachers in equality?

_u1/u3/u57/u79/t335_

You can do this in menu Specification/Card relatioships/Advanced.Example for first lesson:
You have to set for all teachers constraint "Max number of first period lessons" as advanced card relationship, see picture:Same way you can input "Max number of last period lessons".

---

## Our class teachers always have to teach the 1st lesson

_u1/u3/u57/u79/t558_

Please, see this article first: How can I specify class main teacher? 

If this class teacher teaches only one subject, you can simply lock their lesson on that position. See these articles: 
Moving the cards manually
Locked cardsHowever if the teacher teaches more subjects or they have double and single lessons, then it is better not to lock these cards, but rather specify it in the Class - Constraints. 
Note: This option consider always only one period per day. So, even in case, you select two periods (e.g. 1st and 2nd) the constraint will be considered as fulfilled, if the class teacher will have only 2nd period in this class.

---

## Our teachers cannot teach more than 6 lessons consecutively

_u1/u3/u57/u79/t582_

You can specify a global value in menu Timetable - Parameters:
If this value is set to 6 then your teachers cannot teach from the 1st to 7th period in a row, but they can teach 1st and 2nd, then pause and then from 4th to 8th.If you do not care about the consecutive lessons and your teachers can teach or shall teach more lessons in a row, just disable this option.You can also specify this maximum consecutive lessons for individual teacher (the global value must be set first): 
See also: 
Teachers can not teach more than 3 consecutive periods without counting Planning time

---

## How to specify a teacher can teach only one 7th lesson

_u1/u3/u57/u79/t584_

Simple solution
Define the question marked positions:
then define max. on quesion marked positions in teacher's details:
You can specify how many lessons can be placed on question marked positions. You can e.g. specify that the teacher have 6th lesson question marked and max is 2. Then the teacher will have only two 6th lessons per week. Using the check box you can tell the algorithm to consider the question marked count per day. E.g. you can say lessons 5th, 6th and 7th are question marked and the teacher can have max two per each day. Then you can be sure teacher has at least one free lesson to have a lunch each day. Complex solution
You can use this advanced card relationship: 
See also: How to specify that class can have max one 7th lesson or max one 0lesson?

---

## We have 10 day timetable (two weeks), I want to spread teacher's lessons equally into these 2 weeks

_u1/u3/u57/u79/t625_

If your teacher is teaching for example 23 lessons per week (46 in total) and you are using 10 day timetable (2x5days) it can happen that the software generates 30 lesson in one week and 16 in the other week.To prevent this, you have to define advanced card relationship that defines max lessons teacher can teach on the first 5 days (first week):

---

## How to ensure lunch break for teachers

_u1/u3/u57/u79/t719_

If you need to make sure that every teacher has at least one period free during lunch time for lunch, you can input it this way:Example: Lunch between periods 3-5. This means there are 3 periods available. So we can input it making sure that during 3.-5. period teacher can have max 2 lessons.Go to menu - Specification - Relations - Advanced and input values according to this picture:

---

## Each teacher shall have one or two free afternoon

_u1/u3/u57/u79/t759_

The bellow constraint will define that each teacher has 2 free afternnons:
Basically it says, teacher can have max 3 days with lessons on the positions marked on the time map. Make sure you input correctly all the marked entries.Notes: 
- In our example afternoon was defined as periods 5th and above. You can change this by clickin in the time map.
- same condition can be defined for mornings, again just change the map
- you can select only some teachers that shall be considered

---

## Two teachers cannot teach at the same time

_u1/u3/u57/u79/t711_

Usually you do not need to specify this kind of constraint, since most cases are solved by the fact that the teachers have to use the same room or they teach the same group of students. However if you really have two independent teachers, and you do not want them to teach at the same time, you can define advanced cardrelationship that says max 1 card on each position:

---

## Teacher cannot teach 4th in Grade 5 and 5th lessons in Grade 6

_u1/u3/u57/u79/t863_

This constraint can be usefull if you have a situation that you have different bells in grade 5 and grade 6th. 

You need to use cardrelationship:See also:
We have different recess times in parts of school. How to input it? (Solution1)We have different recess times in parts of school. How to input it? (Solution 2)

---

## Teacher must have some lessons in the morning

_u1/u3/u57/u79/t1058_

You can add cardrelationship that says, that each teacher has to have at least one lesson on periods 1,2,3:
Notes: 
- you can of course change the time map to better reflect your definition of morning.
- use change teachers if this shall apply to only some teachers

---

## We need two free teachers on each period to make sure we have enough teachers for substitutions

_u1/u3/u57/u79/t1111_

Add this advanced cardrelationship:
The number 28 specifies the maxiumum number of teachers that are teaching at one time.So if you have 30 teachers at your school and you want to make sure there are always 2 free, you put max 28 teachers on one period.Note:
- If you use cardrelationships starting with "Max cards" or "Max periods" the calcuation may not be correct when you have divided lessons or lessons with more teachers joind on one card. "Max teachers" correctly calculates the number of teachers regardless of joined/divided lessons.
- This solution can generate a timetable where for example one teacher will be responsible for most of the "free" lessons. This may or may not be what you wanted. In case each of your teachers shall have a predefined number of "duties" you can use this solution:
Our teachers have substitution duty lessons, we need min 2 at each period

---

## Teacher cannot teach both in the morning and in the afternoon

_u1/u3/u57/u79/t1138_

You can use Main/Cardrelationships/Advanced and add Advanced cardrelationships:Apply it to teachers - so that it is checked for each teacher indivdually and mark the the two timeoffs the corresponding periods.You do not need to mark all the periods, if you for example leave the 6th period unchecked on both sides it will simply mean the software will ignore the lessons placed on 6th period when checking this rule. Then teacher can have 1-5 + 6 but not 1-5 + 7

---

## Our teachers have substitution duty lessons, we need min 2 at each period

_u1/u3/u57/u79/t1140_

!!!ATTENTION!!! 
Use this solution only in case, you are not using ASC Substitution online feature, which we strongly recommend to you - see this topic: What is aSc Substitution software good for?1. Define new subject "Substitution Duty"
2. Create a lessons 'Without class' with this subject.
3. Then add this card relationship:
You can mark some periods in the timeoff map. The software will then ensure min 2 substitution duties on these marked periods only.On other periods there may be just one, or none. On the marked periods there will be 2 or more.Note:
In some schools this solution is not applicable because it requires you to define how many times each teacher shall have substitution duty.
If you do not know this in advance, you can use this solution:
We need two free teachers on each period to make sure we have enough teachers for substitutions

---

## Teacher cannot teach in two different classes in one day

_u1/u3/u57/u79/t1144_

You can add cardrelationships that says, teacher cannot teach in 5A and 5B in the same day:If you have more classes you will need to add more cardrelationships, depending on what you really need. This rule says that any card that matches the conditions on the left side cannot be at the same day as any card that matches the conditions on the right side.

---

## Teacher can teach max 2 periods per day in one class

_u1/u3/u57/u79/t1160_

Add this advanced card relationship:Select Max periods per day and set the number.It is important to correctly select the apply to combo-box. In this case we have used "apply to selected teachers' classes". This means that this rule is applied to each class where each selected teacher is teaching separately.If you for example select only apply to teachers it would mean that each teacher can have max 2 periods per day.

---

## Two teachers are teaching together, but only 3 times per week out of 5 lessons (lessons with assistant)

_u1/u3/u57/u79/t1162_

You can input this exactly as is requested, so - create 
lesson with one teacher - two times per week 
AND 
lesson with two teachers (via "More teachers" button) - three times per week See: How can I create co-teached lessonsIn timetable you can see two colors on cards with two teachers and two different rows in class contracts from the same subject. 
Notes:
- if you use the same subjet in both lessons, then the software automatically tries to distribute these 5 lessons equally over the week, in this case one period per day.

---

## Teacher cannot teacher more than 3 consecutive periods in one class

_u1/u3/u57/u79/t1166_

Add this advanced cardrelationship:
Please note the: Apply to selected teacher's classes. This will make sure the rule is applied to each teacher in each of his classes separatelly. If you use for example Apply globally, then there could not be 3 conscutive lessons in the whole school.

---

## How to ensure that teacher starts teaching with 1st or 2nd period (he cannot start later than 2nd)

_u1/u3/u57/u79/t1223_

You can add this advanced cardrelationship:Notes:
- you can select the teachers and select only the teachers that have enough lessons 
- as usual: add this constraint only when you can already generate the timetable without it
- in some timetables this constraint might not work, when you for example have much more teacher's than classes there will not be enough early positions to place all the teachers

---

## Teacher cannot have gap of length 2

_u1/u3/u57/u79/t1221_

You can add this cardrelationshipNotes:
- use this only when you have some timetable generatedSee also:
Windows (gaps) in teachers timetables

---

## Teacher cannot teach both 6th and 7th period. He can teach only one of these two.

_u1/u3/u57/u79/t1227_

You can insert this cardrelationship:Select only those two periods in the timeoff - the constraint max 1 per day is applied only on those lessons that are marked as green.

---

## Teacher can teach max 5 lessons per day, but only twice in week

_u1/u3/u57/u79/t1288_

This can be done with using these two constraint. 
1. At first set, that teacher can teach max 5 lessons per day. You can do so in teacher's constraint
How to specify min and max lesson teacher shall have on one day?or with this advanced card relationship
2. Now set that teacher can have max 4 periods per day with two exceptions. It will mean, that these two days teacher can teach max 5 periods, which were set in first step.

---

## Our teacher must teach in consecutive days

_u1/u3/u57/u79/u900_

You can use this advanced card relationship to achieve, that teacher will have no free days between days with their lessons. See also: 
We have teacher who teaches only 2 days per week and it doesn't matter which

---

## Teachers can not teach more than 3 consecutive periods without counting Planning time

_u1/u3/u57/u79/u2545_

In case, you wish to limit consecutive periods for teachers to "max 3" in a row you can use this global or individual setting. 
Our teachers cannot teach more than 6 lessons consecutivelyHowever, if there are some lessons for subject (usually Planning time) which you wish to exclude from this count of 3, then you can use this advanced relation:

---

## Our teachers can teach max 5 days in two weeks timetable

_u1/u3/u57/u79/u3478_

Let's take a case when music teacher work as part-time teacher and teaches 15 music lessons in two weeks. 
Then, if you wish to distribute these lessons into 5 days in two weeks (no matter in which) you can use following advanced card relationship. Note: Do not forget, that this relation must correspond with teachers' lessons settings. See more: How can I define weeks?

---

## Our teacher teach two different subjects but they need at least one period gap between.

_u1/u3/u57/u79/u3484_

If your math teacher teaches also physical education, he will be very grateful, if you create him the timetable with a gap between two lessons for different subjects. You can use this advanced relation.

---

## Our teachers can teach only three different week days in three weeks timetable

_u1/u3/u57/u79/u4764_

Let's take a case, when you have the timetable for more weeks and there are teachers, who teach different lessons in each week (usually some external teachers, or contractors). Then you were requested to distribute their lessons into minimum different weekdays. 
For example, if you put their lessons onto Mon, Wed, Fri in the first week and then Tue Thu in the second/third week – they must come to your school every day in a week. So, in case, these teachers have other activities - they have each day blocked by you. So, it is more friendly to put their lessons on Mon, Wed, Fri first week and then again Mon, Wed second week. This way he will always have Thu and Tue free.
You can do so with this relation: 
Note
With this relation you can save space for teachers, if they teach different lessons in more weeks timetable and you want to minimize usage of the different days in the week.

---

## How can I define that teacher can have max 3 consecutive periods(but he can have 2 doubles)

_u1/u3/u57/u79/t1038_

First you would need to define that each teacher can have max 4 consecutive lessons:
Our teachers cannot teach more than 6 lessons consecutivelyThen you need to say that each teacher can have max 3 consecutive single lessons:
Then you need to specify that teacher can have max 3 consecutive lessons where there are both single and doubles mixed:

Notes:
in both cardrelationships you might want to select relevant subjects, so that for example teachers preparation time and lunch are not counted into the consecutive periods count.

---

## If teachers have more than 6 periods per day, they can teach only 3 periods consecutive.

_u1/u3/u57/u79/u9025_

You can use advanced relation nb 84 - "Max consecutive periods (extended)". In first parameter set a maximum of 3 consecutive lessons and a threshold of 6 lessons per day, the program will enforce this limit only on days when a teacher has more than 6 lessons scheduled. Days with fewer lessons will be ignored for this constraint.

---

## Max one history lesson on 6th-7th position in each class (solution 1)

_u1/u3/u57/u80/t121_

For each subject you can define how many times it is allowed to be on question marked positions. 
At first, define these questionmarked possitions in "Time-off" for subject. Then you can set, how many lessons is allowed. Typical usage of this feature is the following:Imagine the class has 3 lessons of history per week. It will probably not be possible to have ALL three lessons before lunch for all classes. But it will be very bad if ALL 3 lessons are after lunch. Then the teacher can complain that he cannot teach history in that class. So you can specify that e.g 6th and 7th period are question marked and that you accept only one lesson on these question marked position in each class. Then the software will respect only those timetables where all three lessons are before lunch or where 2 lessons are before and only one is after.Notes:
the above is set for ALL lessons of this subject.If you need different settings for different classes you can use one of these options:Specify how many lessons shall be before certain positionMax one history lesson on 6th position in each class (solution 2)

---

## Max one history lesson on 6th position in each class (solution 2)

_u1/u3/u57/u80/t1152_

You can add advanced cardrelationship Max periods per week and specify the 6th and 7th period in the time map:Do not forget to set "apply to selected subjects in selected classes".The software will then check max 1 period of History in each selected class. If you for example use Apply globally the software will allow only one history on 6th or 7th in the whole school.See also:
Max one history lesson on 6th-7th position in each class (solution 1)
Specify how many lessons shall be before certain position

---

## Two subjects cannot follow/Cannot be on the same day.

_u1/u3/u57/u80/t317_

You can create a card relationship that defines that two subjects cannot follow one another or they cannot be on the same day:

---

## Distribution of subject over the week

_u1/u3/u57/u80/t166_

By default, program tries to distribute subject in class's timetable equaly over the week. This default rules are like:
1. If it is possible, program will put cards of subject on different days.2. If number of cards of subject is more than number of days (e.g. 8 single lessons and 5 days), it will distribute it so that number of periods with this subject per day is nearly equal for every day (in our example of 8 lessons, it will require 1 or 2 lessons per day).3.If subject is 2 or 3 times per week, it can not be on consecutive days (you can configure this in menu - Timetable/Parameters).If you do not want the above default behaviour, there are two options to modify it:Option 1:
In Subject/Constraints you can specify the default distribution for the subject. Move the slider to the left to allow the software to put two lesson on one day. See this: Modifying the default card distribution per week for the subjectOption 2:
You can also create customized distribution, where you can specify exactly on how many days the student can be. Using this way also allows you to specify that two single lessons on one day shall be placed consecutively.Go to menu Specification/Card relationships/Add, then select subject(s) and class(es). Then choose "Card distribution over the week" and click on "Settings":
The settings dialog looks like:
You can check any combination for options for the selected subject/teachers lessons. When checking the checkboxes, the pictures shows you what will be acceptable and what will be unacceptable for the generator. For example you can check this case:
I want to have 1+1+1+2 OR 1+2+2 lessons per week.A few more notes:- With "Use above settings only for..." you can filter classes in which is this distribution applied. This way you can e.g. create distribution for classes that have 4 Math lessons per week without need to select those classes in previous dialog.- "Distribution of the group of cards of the listed subjects" can be used to distribute e.g. "Biology" and "Biology lab" subjects together, so it will consider them as the same subject (and will not place them on the same day or consecutive days, e.g.).See also:
Spreading lessons on different periods each day

---

## I do not want my geography to be on Friday and then on Monday

_u1/u3/u57/u80/t331_

The program automatically puts your lessons equaly over the week, not on consecutive days.However by default Friday and Monday are not consecutive days. So if you do not want to have the lesson on Friday and then on Monday you have to define an advanced cardrelationship. Please check the following picture:
It sets that Geography lessons in all classes can be on max one marked day, be it either Monday or Friday.It is important to choose the right card relationship:
"Max. number of days that have lesson on marked position"
and also the 
"Apply to selected subjects in selected classes"
option in second combobox

---

## I want subject in one class to be on the same positions as subject in another class

_u1/u3/u57/u80/t346_

Question: I want to have Math lessons in 5.A on the same postions as English lessons in 5.BAnswer:
You have to define new advanced card relationship (menu Specification/Card relatioships/Advanced) for this purpose. See picture below.See also: I need subject Math to be on the same position in classes 5.A and 5.B

---

## What if 2 specific subjects must be taught simultaneously?

_u1/u3/u57/u80/t219_

If these subjects are from different classes check this article:
I need subject Math to be on the same position in classes 5.A and 5.B.If they are from the same class:
If you have divided class and one part has English and another part have Spanish, the software will automatically put them together if they are from the same division. You do not have to specify this.OK, but the software puts Math there instead of Spanish!
In this case you have to use another division for math lessons. The software can join any lessons if they are from the same division. See: DivisionsIf you do not want to have English alone at the end of the day and Spanish alone at the end of some other day, you might use this: see Both groups have to finish the education at the same time!Another option is to join the groups or class, but use this only when the join is always the same: How to specify lessons where students are joined from two classes?For a very special case you can say that groups have to start at the same time: Groups have to start at the same timeSee also: 
How to input Options - each student needs to select one course from Options1 and one from Options2
Students from the entire grade are divided into groups

---

## I need subject Math to be on the same position in classes 5.A and 5.B

_u1/u3/u57/u80/t408_

Please go to menu - Specification/Card relationships/Add. 
Use card relationship: "The selected subjects have to be at the same time in all selected classes."
See picture:
Notes:1) For 5C+5D, you will need to specify another card relationship.2) If you want this constraint also for English lessons, you will also need to create another card relationship. That is, you will have one card relationship for Math and one for English. (If you select two subjects in single cardrelationsip, it has different meaning, see 3)3) It is also possible to say that two (or more) subjects must be on the same positions in 5.A and 5.B:
See also:
Groups have to start at the same time

---

## Two subjects must follow each other

_u1/u3/u57/u80/t671_

You can create a card relationship that defines that two subjects must follow one another (in arbitrary or specified order):

---

## Spreading lessons on different periods each day

_u1/u3/u57/u80/t259_

Question: How can I distribute e.g. 5 math lessons over the week so that they are on different periods each day. I don't want all the math lessons to be at first period each day.Answer:
You can use advanced card relationship. Go to menu Specification/Card relationships/Advanced. 
- select type "Max days with lesson on the same period". 
- choose "1" in combobox below. 
- choose "Apply to selected subjects in selected classes". 
- select "Classes" where you want to apply this constraint (or leave it as "All classes") 
- select "Subjects" Math (or more subjects). This will ensure that there is max 1 Math (or some other selected subject) on each period.The above picture actually shows two subjects in that card relationships. However since we have specified "Apply to selected subjects in selected classes" then each subject is treated separatelly in each class. So you only need to define one cardrelationship to tell that there shall be only one math lesson and only one English lesson on each period during the week.Cautions: 
- usualy this relationship is not needed. In the complicated schedules the lessons will be totaly random in your timetable.
- this relationship can easily kill your timetable if used inproperly. You shall only add it when necessary, for example when previous generations tend to put some lesson on the same position over the week.
- also you might consider specifying "Max 2" on each period. This is easier to generate and will in most cases do the job.See also:
Specify how many lessons shall be before certain position

---

## I want to have Math lessons in a class on the same period every day

_u1/u3/u57/u80/t692_

You can specify that some subjects must be on the same period every day.Just add a card relationship that says 'Subject must be on the same period each day':
Note: if you specify more subjects, for example Math and English, then Math lessons will always be on 2nd period and English lessons will always be on 4th period.Advanced usage: In some cases you might need to use the advanced cardrelationship. For example if class has 2 English lessons with teacher A and 3 English conversation lessons with teacher B and you want both subjects to be on the same period each day. The usage of the advanced cardrelationships is as follows:Please go to "menu - Specification - Relations - Advanced" and input:- Max different period numbers per week
- 1 (see note below)
- Apply to selected subjects in selected classes
Select subject Math.
Optionally you can select also classes (if you want this constraint to apply only on certain classes).Note: This field should contain lesson length in periods. If you want to have this constraint for a subject that is scheduled as double lessons, input 2 instead of 1.

---

## I need subject Geography to be last lesson on a day in classes 5.A, 5.B, 5.C...

_u1/u3/u57/u80/t703_

You can specify this with card relationship:

---

## Modifying the default card distribution per week for the subject

_u1/u3/u57/u80/t934_

In "Subjects - Constraints" you can find a slider for modifying the default card distribution for the subject. Within this distribution program checks two core constraints - "max periods per day" and "min days per week". Values for these two constraints program evaluates from division "count of lessons per week" and "count of days". The more the slider is to the right the more evenly the subject is distributed within a week. There are 5 positions of slider and we will try to explain all of them on the case of 7 lessons per week. 
1. No distribution - most left position. Within this settings the program doesn't care about the distribution at all. So in our case, they might all end up on Monday. 
2. Low distribution - program relax min days per week and max lesson per day with larger difference. E.g in our case - max periods per day is 3 and min days per week is also 3.
3. Medium distribution - again, program relax both constraints, but with smaller difference. Max periods is 2 and min days is 4.
4. Ideal - this is the default option for all new subjects. Program simply takes the count of lessons per week, divide it with count of the days and then try to place more-less this count into all days. In our case it is 1-2 periods per day into 5 days. 
5. Ideal / consecutive - the very right position. The software not only tries to place the cards into each day, it also checks if they are not on the consecutive days. Of course, in our case it is not possible (our 7 lessons the software distributes into all 5 days) but if you would had 3 lessons per week as in class 5B, they can not be placed without at least one free day between all of them.
See also: 
Distribution of subject over the week
Notes:
- if you know from the start you will want double/triple lessons, input them:
I want to have Single AND Double lessons of one subject! E.g 1+1+1+2
- in case you don not need the subject to be evenly distributed, move the slider to the left, it will make the generations easier

---

## I want just one PE/Art/Drama lesson per day

_u1/u3/u57/u80/t953_

My classes shall have no more then one PE or Art or Drama lesson.You can add this advanced cardrelationship:Select your subjects. and make sure you use "Apply to Classes".

---

## I have Geography two times per week. It shall not be on consecutive days.

_u1/u3/u57/u80/t979_

Select Geography in the subject list and press button "Constraints".Then change the Default carddistribution over the week to "Ideal/No Consecutiive days":Then:
-if you have this subject 2 times per week it not placed on two consecutive days. So not Mon/Tue, but Mon/Wed or Mon/Thu.
-if the class has this subject 3 times per week it is not placed on 3 consecutive days. So not Mon/Tue/Wed abut Mon/Tue/Thu or Mon/Wed/Fri.
-if the class has this subject 4 or more times per week, this setting has no effect it is the same as Ideal setting. So it will not put these subjects on the same daysSee also:
I do not want my geography to be on Friday and then on MondayDistribution of subject over the weekModifying the default card distribution per week for the subject

---

## How can I define lessons that can be outside teaching block(in the afternoon)?

_u1/u3/u57/u80/t1030_

If you have some subjects that can or has to be in the afternoon you can add this cardrelationship:
Now the selected subjects can for example be on 8th period, while normal teaching ends at 5th period. Without this card relationship the software will never create 3 period gap for the students.Notes:
- If you want to limit the maximum gap length the children can have, you will need to add next cardrelationship:
Class can have max 2 gaps per day
- you can also modify the timeoff for classes and subjects to pack the timetable into less lessons, maybe in some cases this is easier than by adding that relationship

---

## There can be two Maths on one day, but not consecutively

_u1/u3/u57/u80/t1064_

If you have 6 lessons of math per 5 day week, then there will be two math lessons on one day. If these cannot be one behind another you need to add this advanced card-relationship:Notes:
- make sure you select the appropriate subjects, if you for example already have double lesson from that subject, they will not be placed.See also:
There can be two Math lessons on one day, but they need to be placed consecutivelyI want to have 1+1+1+2 OR 1+2+2 lessons per week.

---

## There can be two Math lessons on one day, but they need to be placed consecutively

_u1/u3/u57/u80/t1066_

If you have 6 Math lessons per a 5-day week, then two of them will fall on the same day. In this case, you can tell the software to place these lessons consecutively.Add a new card relationship and select the entries marked in red:
The entries marked in green are optional. For example, if you have 6 Math lessons, the software will by default spread them across 5 days (one of the days will have two lessons).However, you can instruct the software to place all 6 lessons within 4 days. Or, as shown in the picture, you can let the software decide whether to place 6 Math lessons over 4 or 5 days.See also:
There can be two Maths on one day, but not consecutively
I want to have 1+1+1+2 OR 1+2+2 lessons per week.

---

## Biology cannot be on the day after Chemistry

_u1/u3/u57/u80/t1084_

Please add the following cardrelationships:Note: 
-you can use the map bellow to specify that for example class cannot have biology in the morning when it had chemistry in the afternoon on the previous day. Just mark the corresponding times in each map.

---

## Double lessons must be before single lessons

_u1/u3/u57/u80/t1154_

Question: Subject Bio in 5th grade is 5 periods per week, 2 double lessons and one single lesson. We need that these cards are distributed over the week in this order: 2,2,1. How to input this?Answer:You need to create a new Advanced card relationship according to this picture:

---

## Biology has to be in the afternoon in certain classes and in the morning in other classes

_u1/u3/u57/u80/t1164_

If you define time-off for Biology, it then affect all Biology lessons in all classes.If you do not want to affect all lessons, you can leave the timeoff empty and define advanced cardrelationships like:The cardrelationship says that there can be max 0 - meaning no biology lesson on the marked periods in the selected classes(5a/5b). So in other words biology in these classes can only be on the unmarked positions.You will probably want to define also other similar rules for other classes that has to have Biology on different positions.Note: 
- you can change max 0 to max 1. This can be usefull if the rule is too strict for your timetable and perhaps you can tolerate 1 biology in the marked area, but not two in any given class. (the rule is applied to each selected subject in each selected class separatelly)

---

## 5A has to have Biology right before or after biology in 5B (the two classes have to have biology lesson on consecutive periods)

_u1/u3/u57/u80/t1259_

You will need to input two cardrelationships for this:1. First specify that there shall not be a gap between lessons from certain group.
Select subjects, classes and "apply globaly":
2. However the above rule will consider as a gap only a space between the two lessons on the same day. So if Biology is on different days in 5A and 5B the software doesn't consider this as a gap. So you will need to add second cardrelationship that will force the lessons into the same day(s):So if you have 3 biology lessons per week in 1A and 3 biology lessons in 1B you will simply request that both 5A and 5B have biology lessons on 3 days. Thus the biology lesson will be in both classes on the same day.

---

## French and Spanish language lessons can be in one day, but with a gap at least 2 periods

_u1/u3/u57/u80/u3480_

Class has 4 Spanish lessons and 4 French. You do not want them to be continuously but also with gap 2 periods at least. You can use this advanced card relationship:

---

## How to distribute lessons in multiple weeks timetable.

_u1/u3/u57/u80/u3482_

You can do so via advanced card relationships "Max days per all weeks". 
Let's take a case, when you have 15 English lessons and you wish to distribute them into 8 days in 3 weeks timetable. 
Just set this advanced relation: 
Note: You can also limit gaps in a day for selected subject, or set another relations to specify max days per one week only then you can get this result:

---

## How to specify that class can have max one 7th lesson or max one 0lesson?

_u1/u3/u57/u81/t552_

Simple solution:
First define the quesion marked positions:
Then you can say the class shall have max one lesson on the question marked positions. This can be done in Class's details:
Complex solution:
The simple solution cannot be used if you want to specify two conditions. For example the class has to have max one zero lesson and max one 7th lesson.In this case you can use advanced card relationship. Here you can specify the area and maximim number of the cards in this area per week. Please check this picture:

We have specified that all classes can have max 2 lessons on the marked positions per week. So it will not happen that one class will have 3 zero lessons.Notes:
- you can use the same cardrelationship for teachers, just change 'Apply to' combobox.

---

## Education block - Checking of gaps in class timetables

_u1/u3/u57/u81/t177_

The software will not create a gap (a window, free period) in a class timetables by default. 
The software calculates so called Education block. Education block is term used to describe time range when some class has to have education. For example it may mean, that every student of some class MUST have education between periods 1-5, and CAN have education between periods 0-7. Generator computes education block automatically based on total number of periods defined in class's lessons and settings in class's details. For most schools this automatic education block works well, but in some cases this automatic fails and education block needs to be set manually.
Possible cases when automatic education block fails: * divided lessons with length 3 and more, which don't have complementary lesson,
* divided lessons with length 2 together with some complicated combination of other lessons without complement,
* divided lessons with length 2 and more in combination with breaks around end of education,
* when you define lunch break as forbidden period using time-off.These are only cases when it is possible that there will be a problem with the education block. Real problem occurs when program says that there is some problem with timetable of class, and you think that this timetable is ok. Program may show one of these problems in verification (Menu - Timetable - Verification): * Class (class name) contains a window
* (Card) is out of teaching blockWhen you click on one of these problems, program will show you more details about it, including area of automatic education block ("Class must have lessons in this interval" and "Class can have lessons in this area). If you are not satisfied with automatic teaching block, you can click on Advanced button in Constraints. This will open advanced Class details dialog where you can specify teaching block settings. You have 3 options here: * automatic - this will compute teaching block automatically. Automatic teaching block is computed so that education starts on period 1 and ends between periods N and N+2, where N is number computed from total number of lessons in class.
* discontinuous - this will completely disable education block and also checking of windows in timetable of class
* manual - here you can specify manual settingsManual settings of education block are defined by four numbers: A, B, C, D.Numbers A and D define when class can have education. You can define similar thing also with Time-off for that class. You can leave those values "Arbitrary" - in that case only Time-off is important.Numbers B and C define area, where all students in class must have education. So there must be lesson on every position in this area for every student. If there is some lessons missing, program will report it as window even in cases when it is not really window.You can leave any of these numbers as "Arbitrary". In case you set all of them "Arbitrary", program will only check windows in class timetable, but will not care about time when students have education. So they can have education one day in the morning and another day in afternoon.See also: Education block - allow some classes to come later or to leave school earlier.
Education block - How to allow gaps in class timetables
What is 0th period (zero period)?

---

## Education block - allow some classes to come later or to leave school earlier.

_u1/u3/u57/u81/t544_

manually set educational block,

The program calculates the amount of lessons per each day automatically. If you for example have 32 lessons per 5days in a week then the software calculates 32/5 = 6.4. So the automatic lessons distribution decides that this class has to have 6-8 lessons each day. In this case the software can spread the lessons like 6+6+7+7+6, or 6+8+6+6+6. It will not generate 9+5+5+9+4Also the software starts with 1st lesson and fills the education for each class until the calculated max per day.This automatic teaching block calculation is good for most of the schools. However if the class has 32 lessons and you want to allow 5-9 lessons each day, you have to set the teaching block manually. In Class -> Constrains -> Advanced you can specify that the children can go home after 5th period, but not later than after 9th period:
Exactly the same way can be used to specify that some children can come later to the school. This comes especially handy if you have rooms or teachers shortage. If some children can start one or two lessons later than the others, then it might help to spread the lessons and solve the room/teacher shortage.On the following picture we have specified that children from 5.A can come to the school at latest on the 3rd lesson (they cannot come later, but they can come anytime sooner):
Please note that this not necessarily apply to the whole class. A part of the class can come later and stay longer, while the other part will come sooner and leave later on the other day. This is especially handy if both groups are using the same room or the same teachers teaches both parts of the school.The education block sets when the children can start and end their education. This basically sets min and max lessons per day they can have. You can specify it even furher if necessary. See Can I set the min/maximum number of lessons per day for one class? A bit more on educational block can be found in this article:
Education block - Checking of gaps in class timetables

---

## Education block - How to allow gaps in class timetables

_u1/u3/u57/u81/u4291_

discontinuous educational block

Please see this article Education block - Checking of gaps in class timetables
for better understanding, how ASC Timetables places lessons into automatic "Educational block". If you wish to allow gaps in classes timetables (and it means also in students timetables) you can set in Class - Constraints - Advanced - Discontinuous educational block. See also:
Education block - allow some classes to come later or to leave school earlier.
Class can have max 2 gaps per day
Student can have max 3 gaps per day

---

## Can I set the min/maximum number of lessons per day for one class?

_u1/u3/u57/u81/t215_

Yes it is possible to set min/max lessons per day for each class.However please note that by default the software calculates this for you. If you have 32 lessons per 5-day week, then the software will allow 6-8 lessons per day. So setting the min/max is only needed when you want to override this automatic calculation or if you have turned it off.Please read this article first. It shows you how you can overide the automatic teaching block calculation:
Education block - allow some classes to come later or to leave school earlier.So if you use an automatic teaching block that calculates 6-8 per day, the software will not put 9 lessons per day. However you can specify that you want max 7 lessons. Go to menu Main/Classes/Constraints/Advanced:
Ok, Ok but I want to have min 5 on week days and min 2 on saturday.In this case you have to define advanced card relationships that defines minimum lessons on one day and specify some days. It defines that you want minimum of 5 lessons on Mon-Fri:

See also:
Education block - allow some classes to come later or to leave school earlier.

---

## Avoid single lesson after lunch break.

_u1/u3/u57/u81/t427_

First see: How to specify when a class can have a lunch?Question: On our school students have 6 or 7 periods in a day. In case of 6 lessons, they are on periods 1-6. In case of 7 lessons per day, they are on periods 1-5, period 6 is lunch break and then lessons on period 7-8. We do not want to have single period after lunch break. How to input this constraint?Answer:
This is a bit tricky: You have to define three constraints to achieve this:1) Define lunch break at periods 6-7 in menu - Specification - Classes - Details.
2) Limit max consecutive periods in class to 6. Go to menu - Specification - Card relationships - Advanced. Choose type: "Max consecutive periods of education", choose 6 in combobox below and "Apply to selected classes". Click OK.
3) Ensure at least two periods after lunch break. Go to menu - Specification - Card relationships - Advanced. Choose type: "Minimal number of periods with education per day on selected positions (empty day is ok), choose 2 in combobox below, "Apply to selected classes" and uncheck periods 1-6, so only periods 7-8 are checked. Click OK.

---

## Both groups have to finish the education at the same time!

_u1/u3/u57/u81/t546_

By default the software can generate a timetable where one half has English on Monday 6th period, while the other half goes home after the 5th period. The next day the groups are switched:
This can greatly increase the chances of generating a timetable.However if some teacher has to go to lunch with children then this behaviour is probably not acceptable for you, because you will need two teachers for escorting children to lunch each day(one for each group). In this case you can forbid this behaviour by checking that 'Groups must finish the education at the same time':

---

## What does the warning 'The entered timetable is probably not complete' mean?

_u1/u3/u57/u81/t707_

By default the software tries to create a timetable for each class that starts with 1st lesson. It also calculates the average lessons per day and tries to balance the lessons put per each day.However if your class has less than 3 lessons per day, the software assumes that this is a special class and turns off the automatic teaching block for this class. So it's lessons do not have to be from 1st period, they can be at any time during the day.
For example: the lessons of class 5.C on the picture can be anytime during the day.
You can ignore this warning message or if you want to get rid of the warning message you can specify that this class shall not use automatic teaching block calculation:

---

## How to apply constraints to whole grades

_u1/u3/u57/u81/t910_

Let's take a case, when you wish to specify constraints, that all "Music" lessons from each grade must be placed on the same day in the week. It means that all classes from 5th grade (5A, 5B, ...) must have these lessons in the same day. Similar for all classes from 6th, 7th and 8th grade. You have two options: 1. Several relations - one for each gradeCreate advanced card relationships - "Max days per week" with these parameters:
- set maximum to "1" - it means max day per week
- apply globally - because you want the software to include all lessons from the all selected classes 
- select all classes from the same grade - e.g. 8.A, 8.B and 8C. for 8th grade.
- select subject "Music"Then you would need to add same card relationships also for other classes. Use "Copy" button and just adjust selected classes. Note
- use this solution, if each grade has different number of music lessons per week, or if setting grades for each class is more complicated for you than creating more similar relations. 2. One relation - for all classes at onceAt first you have to specify grade for each class. Please, see this article: How to specify class gradeThen create similar advanced card relationship as mentioned above - "Max days per week" with following parameters. 
- set maximum to "1"
- apply to grades of selected classes - then the software will internally break the selected cards into groups for each grade and apply the constraint to each group (so for each grade):
- select all classes - so just leave default setting
- select subject "Music"Note
- The advantage of this second approach is that you just need to input one card relationship instead of possible 10 (one for each grade). If you have special requirements that need 2-3 card relationships for each grade, this can be even more helpful. Not to mention the possible errors in inputting 30 card relationships.
- if you select only some classes the software first builds a group of cards and only then divides it by grades. So if you omit one class, its cards will simply not be affected by this card relationship.

---

## Class can have max 2 gaps per day

_u1/u3/u57/u81/t1032_

The software doesn't create gaps for classes and students by default, but calculates the average number of lessons per day and then it places them consecutively. This is ensured by so-called "Educational block". See this article for more information: Education block - Checking of gaps in class timetablesHowever if you need to have gaps in classes timetables, but you wish to minimize them to max 2 free periods in a day, you can do so in this way: 1. At first allow gaps in classes timetables with "discontinuous educational block". See: Education block - How to allow gaps in class timetables
OR
set, that some subjects can be in the afternoon. See: How can I define lessons that can be outside teaching block(in the afternoon)?2. Now you can add use card-relationship "Max gaps per day" to minimize the created gaps:
Notes:
- this topic is for longer gaps, if you just need one lesson free for lunch you can do this directly:
How to specify when a class can have a lunch?
- the same card-relationship can be setup for individual students:
Student can have max 3 gaps per daySee also: 
French and Spanish language lessons can be in one day, but with a gap at least 2 periods
Two subjects must follow each other

---

## Children can come to the school on second period, but only once per week

_u1/u3/u57/u81/t1062_

1. First you need to allow that students can arrive on the second period:
Education block - allow some classes to come later or to leave school earlier.2. Then you can limit how many times this will happen by advanced card relationship that says that class has to have at least 4 lessons on period 1:

---

## Our school works in two shifts, some classes come in the morning, some in the afternoon

_u1/u3/u57/u81/t1146_

If it is already decided which classes come in the morning and which in the afternoon, then you simply need to modify the time-off of the classes:
You may need to raise the number of periods per day in menu Main/School.If you want the software to determine this which classes the solutions depend on the type of your timetable and has to be advised individually.Do not forget to check teacher's gaps. The teachers usually need much more gaps per week in this scentarioSee also:
Windows (gaps) in teachers timetables
Teacher cannot teach both in the morning and in the afternoon

---

## Math can not be right after PE, but it can be before or at least one period later

_u1/u3/u57/u81/u3516_

If you have two specific lessons in the class, which can not follow in specified order (A then B), you can use this advanced relation:

---

## Painting lessons in class must have gap at least 2 free days.

_u1/u3/u57/u81/u4749_

The software distributes lessons into timetable automatically according card distribution settings in subjects constraints. See this: Modifying the default card distribution per week for the subjectHowever, in case your timetable is for more days in a cycle (lets say 7 days), it may be required for some lessons to be "not very close" to each other during the week and its cycle (so you consider also last and then first day again).
Let's say, we have Painting lessons, which are two times per 7 days week timetable. In 5th grade classes you require these lessons shall be at least two days apart AND you wish that there should be gap when week repeats. So you can use this advanced card relationship: 
Note
- If you just wish to have not consecutive days for two lessons from the same subject in a week, you can use either "ideal/no consecutive" card distribution for this subject or advanced relation "max consecutive days" = 1. 
- for maximizing the gap of free days, you can use advanced relation "max free days between cards per week"

---

## The children cannot finish after 8th period, there is no bus after period 8 on our school...

_u1/u3/u57/u81/t315_

Question: the children cannot finish the school after 8th period. The have to finish either after 7th or 9th.Answer:
Please go to menu Specification/Card relationships/Advanced and set the cardrelationship as on this picture:
Now you have entered constraint that when there is a lesson on period 8, there must be also lesson on period 9 (because there must be at least two periods on 8-9, or 8-9 must be empty). So children can't finish on period 8, they have to stay till end of period 9.

---

## Optimizing the room usage for students

_u1/u3/u57/u82/t1103_

The software allows you to input several constraints to improve the usage of the rooms, depending on what is important to you:1. If certain room is better for specific subject:
At least one lesson per week has to be in certain classroom2. If certain room is not very good, but due to capacity you still have to use it, here is how to minimize the usage:
Lesson can be only once per week in certain classroom3. If the lesson can be in several rooms, but you want the class to use the same room on all lessons per week:
We have 3 lessons per week and they shall be in the same classroomWhat is important is that during the input always try to specify all the available classrooms to each lesson. If Music lesson can be in special MusicRoom or in Homeclassroom, input both, not just MusicRoom. The software is not allowed to put the lessons outside of the options you specify so if at least one music lesson needs to be in homeclassroom, it will have problem to generate the timetable.Once you have some timetable generated you can explain to the software which rooms are better/worse either by the above constraints or simply by removing the room from the list of available rooms for certain lesson. But you will know you are on a good path.Notes:
- If you are generating with relaxation, then you may consider adding the above cardrelaxations with lower priority. You may even add two cardrelationships. One that says at least one lesson in better room, second that at least 2 lessons in better room. And specify this 2 is low importance.See also:
Reducing the room usage

---

## At least one lesson per week has to be in certain classroom

_u1/u3/u57/u82/t1099_

Let' say you have more classrooms for your Physical Education lessons (few Gyms with different sizes -"big and small" , Playground for outdoor activities, Fitness gym with specific equipment in the school basement). 
Generally you want the kids to be always in the Big Gym classroom, but you know this is not possible. Some of the PE lessons need to be also in Small Gym, or outside on Playground)To make sure, that each kid is at least once per week in the best classroom you can use following: 1. At first make sure that you have defined all the Gym rooms as available to all PE lessons. Then the software can choose any of them during the generation. See these articles: 
How to assign lessons to classrooms?
How can I specify default (usual) classrooms for certain subject?2. Then add the advanced card relationship nb. 51 "Min periods per week in selected classrooms". 
In Advanced dialog select: 
- min = 1 - So at least one PE lesson per week shall be in BigGym
- Apply to groups in selected classes - If you divide your PE lessons to groups Girls/Boys, this would guarantee the BigGym at least once for each group. If you however just select "Apply to selected classes" the generator will only check if there is one PE lesson per class, which will mean that only boys will be in BigGym.
- the classroom - in our case it will be the "Big Gym"
- the subject - it will be "Physical Education" See also:
Optimizing the room usage for students

---

## We have 3 lessons per week and they shall be in the same classroom

_u1/u3/u57/u82/t1076_

Problem:
Lets say that class 5A has biology lesson three times per week. Biology lesson can be in BioLab1 or BioLab2 or BioLab3, the generator can choose one, but it has to be the same room for all 3 biology lessons.Solution:
1. Input the biology lesson so that it can be in any of the 3 labs:
2. Add advanced cardrelationship that says that Bio lesson in any class can occupy max 1 classroom per week:

---

## Lesson can be only once per week in certain classroom

_u1/u3/u57/u82/t1101_

For example you have two Gyms at your school. Big and small. Unfortunatelly these are not enough to accomodate all your Physical Education lessons, so in some cases you allow the Gym to be in the cellar in the basement. But of course you want to minimize this.So you can simply say that this room can only be used for example 5 times per week:
Notice the 'Apply Globally'. This means the max 5 is applied to all the PE lessons at your school.So this way you have limited the usage of the basement room to necessary minimum. However it can happen that even though this room is only used 5 times, it maybe that one class have all their lessons in this basement room.To fix this you can add next cardrelationship that will say that each class(or group if your PE is divided into groups) can have max 1 PE per week in the basement: 
Now each group has PE max once per week in this emergency classroom and the room is used only 5 times per week in the whole school.Notes:
- once you genererate a timetable you may try to harden the constraints and try max 4 per week.See also:
Optimizing the room usage for students

---

## Reducing the room usage

_u1/u3/u57/u82/t1105_

The rules descibed in:Optimizing the room usage for students
shall help you to achieve the room assigment that is acceptable from the timetabling point of view.However once you have the timetable ready you may want to reduce the room usage for example to save on cleaning costs or to allow more room renting.Here are some tips:
GymRoom can only be used 4 days per week(GymRoom has to be free on 3 afternoons)
or
Concentrate groups of lessons into fewer classroomsNotes:
- add these rules only after you have an acceptable timetable.
- generate with relaxation and use low importance for these rules so that yuo do not create much worse timetable for teachers and students just to fee the Gym room for renting on one afternoon.

---

## GymRoom can only be used 4 days per week(GymRoom has to be free on 3 afternoons)

_u1/u3/u57/u82/t1107_

If you specify only the afternoon lessons in the timeoff map, then the constraint will only count days where the classroom is used in the afternoon. So you can specify for example max 2 on afternoon lesson, this would mean that the classroom is free on 3 afternoons per week.See also
Reducing the room usage

---

## Concentrate groups of lessons into fewer classrooms

_u1/u3/u57/u82/t1109_

For example the have 3 laboratories and Biology and Chemistry lesson2 can be in any of these. You can add this constaint that will specify that only 2 of these 3 laboratoris can be used on each day, for example to reduce cleaning costs:Of course the above is more or less equivalent to removing one Lab from the school. But if you generate with relaxation allowed the above has two advantages:1. if depending on other constraint it is not possible to use just 2 rooms, the software will relax this and use 3. If other constraints permit this, it will use 2.2. more imporantly the relaxation works per days, this may produce a timetable where on most days you will use just 2 labs and only on a few days it will be necessary to use and clean all 3 labs.Note:
-the affected labs were specified indirectly via the subjects that use them.
-add these constraints only after you see you can generate with 3 labs.See also:
Reducing the room usage
GymRoom can only be used 4 days per week(GymRoom has to be free on 3 afternoons)
Optimizing the room usage for students

---

## More lessons

_u1/u3/u57/u82/u6117_

Enhanced classroom capacity counting
If you allow multiple lessons to be scheduled in the same classroom, the software now checks if the capacity is enough to host all the scheduled lessons. This is useful for example when using a single gym for multiple grades, it can accommodate boys from 5A+5B or 5A+5C but not 5B+5C as this last one would be too many kids for that room. Another scenario is exam schedule.

---

## Student has to finish Biology before he can attend Biology practice

_u1/u3/u57/u83/t1114_

If student has to complete certain course(subject) before he can start with another you can use one of the following cardrelationships:Then just specify the two courses:

---

## Subject has to be in consecutive weeks/terms

_u1/u3/u57/u83/t1116_

If you have a subject that has to be in 2 consecutive terms(it cannot be in term 1 and then in term4) you can input this cardrelationship:
So you define that lesson as 2 times in "Any term" and add the above constraint.The same can be used when you have for example 20 week timetable and certain course has to be in 8 consecutive weeks.

---

## Two subjects have to be at the same time in both weeks/terms

_u1/u3/u57/u83/t971_

For example you have one doulbe lesson of Algebra on week A and one double lesson of Geometry in week B. The software may put them on different days, which is usually not a bad thing.However if you want them to be on the same time in each week, because teachers might swap kids, you can create this cardrelationship:
Basivally this will say there can be max 2 periods per all weeks. If the lessons are not at the same time, they will need more periods, thus the generator has to put them together.Notes:
- if you have just one lesson per week, you need to specify max 1 period per all weeksSee also:
What does "Apply to" mean in the cardrelationships?

---

## Is it possible to prevent two specific lessons from being taught simultaneously?

_u1/u3/u57/u84/t217_

You can prevent two lessons from being taught simultaneously simply by adding the some resource - teacher or classroom, that is required by both lessons. If for example Math and Physics are taught by the same teacher, or they must be in the same classroom then this will happen automatically and software can not place such lessons on the same period.Please see: 
Adding and Editing a lesson
How to assign lessons to classrooms?However, if you situation is differently - e.g. those lessons are taught by different teachers and they are placed in different classrooms - and you still do now wish them to be taught at the same time, you can use this approach: 
Two teachers cannot teach at the same time

---

## Specify how many lessons shall be before certain position

_u1/u3/u57/u84/t245_

You can create special card relationship that defines how many lessons shall be before certain position. For example this picture defines a cardrelationship for all classes that have 1,2,3 or 4 biology lessons. For these classes the generator shall always place at least 2 lessons before 4th period:So now there are at least 2 lessons of biology on good positions.For classes that have more Biology lessons per week you can specify another card relationships.See also:
Max one history lesson on 6th-7th position in each class (solution 1)

---

## Groups have to start at the same time

_u1/u3/u57/u84/t279_

Note: This article is about groups within one class. If you need two subjects from different classes, please see:
I need subject Math to be on the same position in classes 5.A and 5.BNow: how to make sure two groups start at the same time:
Please check this picture. It defines that Spanish and German groups will always start at the same time:
Be carefull: in most situtation you don't need to setup this cardrelationship because you assign the lessons to groups and only the groups from the same division can be at the same time. So the software will not put Spanish for Group1 together with PhysicalEducation for Boys. See DivisionsAnother wrong usage of this cardrelationship is to prohibit the generator to put Group1 at the end of Monday and Group2 on the end of Tuesday. If you want the children to finish at the same time, you better use the corresponding check box in Class/Details: See Both groups have to finish the education at the same time!On the other hand this cardrelationship is good when Group1 have Cooking lesson that lasts 3 periods while the Group2 shall have Sewing lesson and then Handworks lesson during this time and the Group2 shall start with Sewing lesson.See also:
I need subject Math to be on the same position in classes 5.A and 5.B

---

## I have double and single lessons but doubles cannot be on Monday

_u1/u3/u57/u84/t402_

E.g you have e.g 3 single Math lessons and one double Math lessons. You do not want that double to be on Monday or on Wednesday.You have to create a advanced cardrelationship just like on this picture:

---

## Maximum one planning time lesson per day

_u1/u3/u57/u84/t709_

The planning time lessons can be inputted as lessons without class. They are shown in teacher's timetable and they are independent from any class.

Using the advanced cardrelationship you can specify that teacher can have max 1 planning time lesson per day:Take care to specify the correct values:
- Select "Max periods per day (#10)"
- Specify max 1 per day
- Select "Apply to selected teachers"
- Specify the subject - "Planning time"

---

## Biology in 5A has to be only on Wednesday (or Biology cannot be on Wednesday)

_u1/u3/u57/u84/t940_

If you want a particular lesson to be just on one day you can use this cardrelationship:
Basically it says you want 0 periods of biology in 5A on the marked days. Thus the Biology in 5A can only be on Wednesday.Notes:
- this approach is better then locking, because there are 7 different positions the Bio can end up on Friday
- you could have created a new subject called "BioFriday" and set the time-off, but this approach is cleaner, no fake subjects.
- the same cardrelationship can be used to specify that Bio cannot be on Monday, just select Monday in the weekly grid.

---

## What does &quot;Apply to&quot; mean in the cardrelationships?

_u1/u3/u57/u84/t973_

What does "Apply to" mean in the cardrelationships?

When you are defining advanced cardrelationships you can specify the Apply to commbobox.Lets suppose you specify condition max 1 Math or Geom per day:
Now lets see what each apply to option will mean:Apply Globally
There can be max 1 Math or Geom lesson per day in whole school. If Teacher Einstein have Math on Monday, no other teacher can have Math or Geom on Monday.Apply to Teachers
Each teacher can have max 1 period of Math or Geom on each day. So if Einstein has Math on Monday, he cannot have Geom or another Math on Monday. But other teachers can have, of course, just one per teacher.
If you specify some teachers in the filter, only these teachers are considered. The other teachers are not affected at all.Apply to Classes
Similiar to teachers, each class can have 1 Math or Geom per day.Apply to Subjects in Selected classes
Each class can have max 1 math per day and max 1 Geom per day. So if 5A has Math, it cannot have another Math on the same day, but they can have 1 Geom. Apply to classrooms
Each classroom will get max 1 math or geom per day. Apply to students
Each student will get max 1 math or geom per day. So the class can have 5 math lessons per day each one for different students. This condition only works if you input students and courses. It doesn't work on regular groups.Apply to grades
See this: How to apply constraints to whole gradesNotes:
- in theory you can do everything with "Apply globally". However you will need to create a separete cardrelationship for each teacher. Apply to teachers allows you to create just one cardrelationship that internally breaks up and works on each individual teacher.See also:
What does the time map in advanced cardrelationships mean?

---

## What does the time map in advanced cardrelationships mean?

_u1/u3/u57/u84/t975_

Let us consider this cardrelationship: 

As inputted, it says that each teacher can have max one day per week with lessons placed on 6-10. In other words it means each teacher will teach only once per week in the afternoon.
He/she can have any number of lesson on periods 1-5, this cardrelationship only considers the afternoon periods.If you input the same condition without specifing the time map:

it would mean that each teacher can teach only on one day per week.See also:
What does "Apply to" mean in the cardrelationships?

---

## Double lesson cannot be over certain breaks

_u1/u3/u57/u84/t1086_

In most cases the best solution is to define breaks between lessons. By default your double lessons cannot span over these breaks.See here:
How can I print breaks between lessons?
Certain longer lessons can be over all breaksHowever in some cases you need more precise specification. Using this cardrelationship you can precisely define which subjects, what days, lessons etc:Adding this constraint will prevent any double lesson from crossing the break between 2nd and 3rd period, but only on Wednesday-Friday:Note the "opions button" where you can define that this cardrelationship shall only consider double lessons.

---

## Double lesson cannot be on Monday (specific days/periods/part of the day)

_u1/u3/u57/u84/t1156_

For this constraint use the menu "Main - Relations - Advanced". 
With relation type "Max periods per day" you can simply say, that there can be 0 periods (3.) on day selected in time-off map. There select Monday only (6.) (or other required possitions, where you do not want your lessons to be) .Important for this specific case is to use the "Options" button (7.), where you can select, that this rule shall only apply to the lessons of length of 2 periods

---

## Checking room capacity

_u1/u3/u57/u84/t1257_

For each room you can define it's capacity - maximum number of students it can hold:
Then for each class(entire class) or for each group of students you can specify how many students are in it:
The software then check this capacity during the generation and it also can warn you if you manually put bigger class into smaller room:Notes
- if you are using seminars(courses) you do not need to specify how many kids are in class/group the software knows this because it knows about individual kids

---

## Double lessons can not start on even periods

_u1/u3/u57/u84/u1199_

You can use advanced card relationship #32 (or #33)
