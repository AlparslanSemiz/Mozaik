# Testing the timetable

aSc Timetables yardım belgelerinden alındı (9 konu).
Üreten: `node scripts/asc-yardim.mjs`

---

## Why to test the timetable?

_u1/u3/u59/t128_

basic test

Before you generate your timetable, it needs to pass the basic test. You can find it in main menu as "Test" or in menu "Timetable - Test". This first test tries to generate small parts of your timetable to detect the basic mistakes in your inputted data or constraints. It will try to generated each item - class/teacher/subject/classroom separately and it checks, if there are not some basic mistakes. Finding these mistakes is very important, because if it is not possible to generate timetable for just one class or one teacher then it will not be possible to generate whole timetable for sure. So this basic and very quick test can save you lot of time that you will otherwise waste on generating "an impossible" timetable. Do it every time after some relevant change (change the lessons settings, adding a new or editing already created constraint or relation,...). We recommend you to do it simply before every generation. Test says there is some problem. What next?However, if your timetable passes this basic test, it doesn't mean, that there are no other problems, which will come out, when you will start to try to generate entire timetable (or just more classes/teachers/... at once). If your timetable has passed this basic test, and it still can not be generated, then we recommend you to see our other tools for analyses: See also:
Test says there is some problem. What next?
Analyze the timetable by generation
Analyze the timetable by Extended tests

---

## Test says there is some problem. What next?

_u1/u3/u59/t130_

At first, please, see this article: Why to test the timetable?When the test fails, it will report the item which was not able to generate and it will offer you some options that will help you to find and resolve the problem:
CHECK and FIX this problem - program will show you the part of the timetable that it has generated and give you the card that it can't generate. You can check why the software was unable to put this card in. 
The complete guide is here: Checking and Fixing exampleTest this item AGAIN - maybe the timetable for this item is just too complicated to generate and this is the reason why the test failed. When you run the test on the same item again, it may succeed (this is quite rare case).Test with RELAXATION - this is a very similar option to the first one, only the program will try to generate this item with constraints relaxation turned on and if it succeeds, it will show you, which constraints have been relaxed. This may be helpful in finding the constraint that is too restrictive. Your task at this moment is the same as with the first option - complete the timetable of this item (and possibly change constraints or data), so that the program will accept your solution.SKIP this item and continue testing - skip this item and continue testing remaining items. You can return to this item later by invoking the test again (menu - Timetable - Test).END test - quit testing of the timetable.HELP - show this help page.

---

## Checking and Fixing example

_u1/u3/u59/t598_

1. Tests says there is a problem with 5A. We select Fix:
2. Test shows us what it was able to achieve and also gives us the card it was not able to put into the timetable. In this case it is music lesson:3. We cannot put the Music lesson on 7th period as we have forbidden 5.A to have 7th lessons. 4. So we decide to put it on Monday 6th lesson and move the Ge lesson to the 1st lesson

5. Once we moved the Ge lesson to 1st lesson, the software displays verification that says it was not a good place because there is not a free classroom for the GE lesson:
6. We can click right mouse button on that lesson to quickly check the available classrooms:
7. We will find that this lesson is required to be in the Home classroom only. The problem is that this is a divided lesson and the only lessons that can run at the same time also have to be in the home classroom.You obviously have to allow some other classrooms for these divided lessons. If you look at the first picture this was also a reason why the software hasn't put the divided lessons together from the start.
This example showed us how the test can help to find out a problem.

---

## Testing multiple classes/teachers at once

_u1/u3/u59/t126_

You can test multiple classes/teachers/classrooms/subjects/students this way: First go to corresponding view (Whole/Teachers/Classrooms/Subjects/Students). 
Then select rows that you wish to test. You can do it by clicking on row headers. Use Ctrl+click to add row to selection and Shift+click to add sequence of rows at once. Then right-click on some selected row header and choose Test.Note: It is also possible to test multiple items by right-click on any card, then choose Test - More.

---

## Generate draft timetable

_u1/u3/u59/t930_

At early stages of timetable generation it is advised to try to generate draft. Draft is timetable without any constraints. This is very usefull, because it makes no sense to generate complete timetable with all the inputted constraints if there is some basic problem in the input.You can either remove the constraints, or use a feature called Draft:
After selecing "Draft" generation, you can specify which constraints you want to turn off, and which shoudl be active with strict or relaxed generation. Then press "Generate" and a timetable will be generated with the constraints you allowed.

---

## How can I test just some lessons, for example all double lessons or all PE lessons

_u1/u3/u59/t942_

Sometimes it may be usefull to try to test if you can put some group of lessons into the timetable.For example put in all double lessons or all divided math lesson.This is possible:
1. click right mouse button in the bottom part where the unplaced cards are shown and select Filter.
More on filter can be found here:
How can I filter cards displayed in the list on uplaced cards2. Click right mouse button again and select Test. The software will now try to place all the cards into your timetable that match the Filter options selected in the first step.See also:
Testing multiple classes/teachers at once

---

## Testing card relationships

_u1/u3/u59/t1136_

You can test also individual card relationships:You can do this by right clicking in the upper left corner of the timetable, then choosing "Test - Card relationships" and choose one of the relationships. This will generate all cards from that relationship, which can help you understand whether the card relationship does what you want or if there is some problem with it.

---

## Analyze the timetable by generation

_u1/u3/u59/t1183_

Analyze generates the timetable for exactly 1 minute and then shows you which cards were causing the most problems.On some timetables this may help to quickly identify some errors in the input or some bottlenecks that simply cannot be scheduled and had to be fixed before generating the whole timetable. However on some timetables this function will not help much because the cards that are causing most problems are simply, well, the hardest cards.Lets now have a look at some examples to see where this feature can help and how to read the data.Example 1.
This timetable passed the test, so it is possible to generate each single teacher/class/subject or room. But it is still not possible to generate the whole timetable. One card constantly gets left out. One may say that this is because it is Physical education and it simply hard to place it. So the first attempt was to try to generate on harder complexity. But this hasn't helped - the timetable still cannot be generated.So we run "Analyze by Generation" to see if it can help:
After a minute the software shows the same timetable in different colors:
Red cards are hard, white cards have caused no problem. We can see that there is a group of red cards in classes 704, 705 and 707. Also one of the cards at the bottom is in red. Clearly there is something wrong not with just that PE card, but also with all the cards of teacher "Chloe". It is not possible to place the last Chloe's card because she either already teaches on that position, or kids are not available because they are having PE. There are 29 positions per week but 3 positions are blocked by PE. You cannot put in Chloe's lessons on these position, because all the kids have PE. So the result is that there are 26 positions for Chloe's lessons. But Chloe has 27 lessons in these classes. There is no way around this, you either need to split PE or move at least one of the Chloe's lessons to other class. So using Analyze we have found that there is no problem with PE lesson, the problem is in Chloe's contract combined with PE lesson.Example 2
Running timetable/Analyze by generations, shows these cards in red:

So we go back to the original colors:

and then check these lessons: 

It is immediately clear that these cards cannot be placed into the timetable because one group in each grade is joined and the other groups that have to be in the same time are taught by the same teacher. Again, this is problem in the input and there is no way to do the timetable until it is fixed.

---

## Analyze the timetable by Extended tests

_u1/u3/u59/t1185_

If it is possible to test your timetable but the full generation still fails, this feature might help you pinpoint smaller part of your timetable that is still not possible to generate.You can run it via menu TimeTable - Analyze - Extended tests:
A dialog appears that shows the progress of the extended tests. For example on this picture, the software first tried to generate a timetable without any constraints except for time-offs for classes. This generation was successful. See Nr.1:
Then the software added time-off of teachers. This was not successful. So the software tried to remove classes one by one, to find the smaller part of the timetable that still cannot be generated considering only time-offs for teachers and classes.After a few generations it found out that it is not possible to generate just two classes. See Nr.2So now you know where the problem lies. You can even use button "Show me". This will start "Draft" generation only on the problematic subset and with only the constraints involved. After generation it will show you the last card that was not possible to place so that you can try to place it and find what could be the problem.Notes:
- this extended test can take a very long time on some timetables. So run it only when you have time. When you come back, the software may find something useful. Or may not.
- this is test, so it is still possible that if you generate a reported part several times or on higher complexity, you may find out that it actually is possible to generate it. In this case you can have a look at list of individual tests what else the test has found. See Nr.3 on the above picture
- the time-offs of classes are always included, because in general these are non negotiable so it doesn't help much when the software says it is possible to generate your timetable with Friday 7th period, when your school is closed already. But this also means that if you have some time-offs that are theoretically possibly, try to remove them.
