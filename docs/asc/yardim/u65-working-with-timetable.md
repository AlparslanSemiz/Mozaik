# Working with timetable

aSc Timetables yardım belgelerinden alındı (24 konu).
Üreten: `node scripts/asc-yardim.mjs`

---

## Working with timetable - general information

_u1/u3/u65/t518_

The main aSc TimeTables screen consists of several parts: 1 - Menu - contains commands for program control.
2 - Toolbar - keys for quick selection of the most frequently used commands.
3 - The timetable contains cards, each cell is representing individual lessons. 
4 - Row headers. Click here to select the class, right click to show class's options.
5 - The control panel contains information about current operations as well as lists of unplaced cards.
6 - Brief info about the card under the cursor.
Classes are displayed in rows, days and periods in columns. 
The timetable contains colored cards representing individual lessons. The color of a card indicates the teacher who teaches the particular lesson. Split lessons are displayed with a card of half size, lessons divided into three groups with third size, etc. It means if we define by entered data that the teacher Mr. Henry teaches mathematics three times a week in the 1A class, the program will prepare three identical cards for the 1A class indicated as Mathematics and with the color assigned to Mr. Henry.Cards are placed in the timetable according to how the program generates them or how they are placed manually. You can generate a timetable and subsequently, if necessary, change it by moving cards with the mouse. You can change the lessons, teachers, classes at any time.Before you look at that how it is possible to change a timetable manually, here is a description of the Control Panel:
Control panel

---

## Control panel

_u1/u3/u65/t522_

The control panel is located at the bottom of the screen. It consists of three parts:
1 - Information about the current card is displayed in this field when the cursor is placed on the card.
2 - The button for viewing the timetable of the current teacher or class.
3 - The panel of not-placed cards.The tabs, located at the bottom of the Panel of not-placed cards are used to define displayed cards: 

First icon displays all not-placed cards
Remaining icons display cards of the selected class, teacher, subject or classroom.You can click on the button in the middle to show the timetable for the selected teacher or class:
If there are more cards, so not all of them fit on the Panel of Not-Placed Cards, yellow arrows will be displayed on the right.

---

## Moving the cards manually

_u1/u3/u65/t538_

You can change the timetable by simple movements of cards. Of course, the program checks for collisions of classes, teachers and classrooms.Procedure for moving a card:1. Click on the card with the mouse and “pick it”. Now move the card with the mouse:

You can click also on a card located in the bottom panel of not placed cards.The class the card belongs to is displayed in green. The program will not allow you to place it in another row.Column headers can have this colors::
A. Green indicates it is O.K.;
B. Red means occupied position (the position in which the teacher is assigned somewhere else),
C. Blue means question-marked position;
D. Grey means fully inappropriate position (time-off).2. Place the card by clicking on the desired position.When you place the card, the program will automatically assign an available classroom to the lesson from the list of available classrooms. If you place the card in a position in which no classroom is available, the program will accept it, but it will display a white stripe on the left edge of the card to symbolize that no classroom has been assigned to the card.

Similarly, the program will allow you to place a card in a not allowed position as well. But it will warn you by a red stripe on the card. It’s up to you whether you want to have the card in the position or not.
In case of collision the software either switches the cards, or shows you this popup in case of more cards are colliding:

You can select the action to resolve the colision. If you select another card from this popup menu, the original card is placed and you continue with the selected card.See also:
Related timetables

---

## Removing placed cards from the timetable

_u1/u3/u65/t524_

"Removing" in this article means just un-placing cards from the timetable. Lessons represented by these cards will not be removed from the contracts. You can remove a placed cards from the timetable in this way:1: One-by-one (single selection) 
a - Click on that card to select it. Then you can just click right mouse button while holding the card, or move it to the panel of non-placed cards and drop it there. 
b - Use right click on the card and select "Remove" from context menu.
2: Removing entire row (group selection) 
a - use right click on a row header and select "Delete row". 
b - use right click on any card in the row and select "Delete row" from context menu
c - select more rows with holding "Ctrl/Shift" key and then use right click on any row. Select "Delete row" from context menu
3: Removing all cards from timetable 
Use menu Timetable -> Remove Timetable and unplace all unlocked or locked cards. You can also just unplace lessons from already assigned classrooms. 
See also:
Delete all unplaced cards
My lessons are not placed in classrooms/Adding classrooms into created timetable
Right-click on card or free positions
Removing placed cards from the timetable

---

## Right-click on card or free positions

_u1/u3/u65/t528_

When you do a right-click on the certain object (a card, row headers, column headers, empty period, free space in control panel,...) the program will offer you a context menu with the most frequently used features for that particular object. Right click on the placed card
In the context menu you can:
1. Lock/unlock - fix the card on selected position. Then it will not be replaced during the future generation of your Timetable. See: Locked cards
2. Remove - unplace the card from timetable. It will be moved to the control panel among all unplaced cards. See: Removing placed cards from the timetable
3. Delete row - unplace all unlocked cards from the entire row, where is the selected cards. 
4. Classroom - select the one of the assigned classrooms for this lesson or change the classroom to another (classroom has to be assigned for the lesson first). See: Working with classrooms.
5. Edit lesson - open the lessons dialog and change the lessons definition completely. See: Adding and Editing a lesson
6. Lesson grid - switch the main view to the "lesson grid view ". There you can edit the lesson via lessons grid features. See: Lesson grid overview
7. View - display the preview of the timetable of the selected related object (teacher/subject/classroom/class)
8. Find - open a dialog with all types of objects as the one you select from the related to that particular lesson
9. Time-off - see and edit the time-offs of the related objects
10. Test - start to generate the timetable of the related objects

11. Quick changes - show additional menu with quick actions to change selected lesson or the card only . 
Right click on the free position
In the context menu you can: 
- pick and place the card from the list the program will automatically offer and can be placed on the position
- delete row - unplace all unlocked cards in selected card's row,
- time-off - quick setting of the time-off on selected position.See also:
Right-click on row headers

---

## Right-click on row headers

_u1/u3/u65/t594_

Once you right click on the row headers you will see the context menu:
Here you can quickly: 
A - Test the selected item. See: Testing multiple classes/teachers at once
B - Open dialogs for item's details, time-offs, constraints, lessons and in case of classes also divisions. You can also open print preview with timetable for this selected item only. 
C - Open verification dialog with all inputted constraints. You can quickly check for broken constraints or card relationships linked to specified item. Using "stars" or "colors" can help you by marking items for easier identification.
Verify just one class/teachers/subject
D - In the last area you can remove all cards, or lock/unlock all cards already placed in selected row. 
Locked cards

---

## Locked cards

_u1/u3/u65/t526_

At firs please note, that locking cards is generally not a good idea. Locking a card on an unlucky position can prevent your timetable from being finished. If there are at least two ways how to place some card, then it is better to explain the generator where the cards might go. You can do so via hundreds of constraints and relations you can set in the timetable. Please, see this topic: ConstraintsHowever, if you know that a lesson must be taught at a very specific time, i.e. its card must be in a particular place, you can lock the card in that place by clicking on it with right mouse button. The locked card has a small stripe in the right bottom corner:
If you wish, you can also lock lessons in entire row with class'es/teacher's/classroom's timetables - via right click in first cell with the row header (you can select also multiple rows): 
Timetable for individual periods (represented by columns) can not be locked, but you can lock timetables for entire day. 
You can lock/unlock all placed cards by using the commands from the Timetable menu:
Locking has two advantages: 
- the position of the card will not be changed when you are manually moving the cards; 
- the generator does not move locked cards.See also:
Biology in 5A has to be only on Wednesday (or Biology cannot be on Wednesday)

---

## Working with classrooms

_u1/u3/u65/t530_

The generator automatically assigns the classrooms and also while manually moving the cards the classrooms are automatically assigned. So the below described functions are only necessary when you want to rearange the classrooms:Cards without classroom are marked with white stripe on them:
Placing a card in a classroom:Right click on a card you want to assign classroom to and click on the classroom that you want to use:

Marks before individual classes mean:
"Red cross mark" means Occupied classroom. Other lesson is already taught at that time.
"Blue tick" means that the lesson is already placed in this classroom.
A classroom without a mark is free (empty).Releasing a card from a classroom:Right click on that card and choose Empty classroom.
The command is not available if the card is not placed in a classroom.See also:
Classroom view

---

## Custom views

_u1/u3/u65/t532_

The Whole basic view, which displays the complete timetable, is always available for each timetable. However Custom views allow you to effectively divide entire timetable into smaller and more easy readable parts. For example you can display only 5th grade in one view.Defining viewsYou can define your views from menu View - Define. After clicking on the New or Edit option you can edit view's properties:
Select if you wish to create new view for classes or for teachers. By clicking on Change you can specify which classes or teachers you want to see in this view. You can also specify the number of lessons including the zero lessons.Switching between viewsYou can switch the views using the combobox on the toolbar:
Note: you can also print the custom view. This is handy when you want to print only some teachers or classes. See also: 
Quick modification of the onscreen view

---

## Quick modification of the onscreen view

_u1/u3/u65/t833_

You can quickly change the current view of your timetable in this way: 
You can specify the texts and colors, which will be used on cards. 
For example by choosing classroom as color, you can see the timetable with colors defined by the classroom and you can also specify different text on cards. Note: 
This change is not automatically saved. It means, that after you save or load the timetable again, this setup will reset to its default values. If you want to keep your new settings, just specify this requirement in menu "Options - Customize the software - User interface" 
See also: How to show the timetable colored by buildings
Custom views

---

## Undoing and restoring operations

_u1/u3/u65/t534_

You can move between your changes in the timetable by menu View - Undo/Redo:
Please note that this only affects the positions of the cards. It is not possible to Undo changes in the contracts.It is a good idea to use File - Save as... to save the timetable on disk under different name. That will allow you to store a semi-finished version of the timetable, to which you can return in the future.

---

## Classroom view

_u1/u3/u65/t588_

Classroom view is a special view because when you move cards in this view, then only the classrooms are changed. The positions of the cards are not changed.So for example the following picture shows you that you can easily move physical education for 8H from Small to Big gym room:
The cards shown in the control panel are either cards that are not yet placed in the timetable or cards that are placed but they do not have a classroom assigned yet. These are marked with white stripe:

---

## Filter function

_u1/u3/u65/t811_

Just press right mouse button anywhere in the unplaced cards section. A popup appears where you can select some advanced filters, like show only double lessons or show only lessons that have only one section:

So if the school wants to create a timetable by hand from the scratch, they can filter only lessons with one section only and start with these.

---

## Working with days in the main view

_u1/u3/u65/t821_

By default, the software shows all the days on the main screen, usually from Monday to Friday. If you for example want to see only one day, you can do this in the days combobox. This one is not visible by default, you have to turn it on in the options dialog:

Then you can select a day you want to display:

---

## We have the same timetable each day in given term or week

_u1/u3/u65/t823_

If you have exactly the same timetable each day then you probably don’t need to see in 5 columns at them main screen. What you need to do is to show the days combobox see above and then pick Days merged:

Combine this with the “show all terms separately” in the combobox for terms and you will get a view with one column for each Term and with this column all days are merged, so you have only the periods as subcolumns.
Note: you still can have some lessons that are on different positions each day. If you for example have all lessons at the same periods each day, only one lesson is different on Tuesday and thursdsay, the software will simply put two entries into to appropriate column.

---

## How can I filter cards displayed in the list on uplaced cards

_u1/u3/u65/t944_

You can right click in the bottom part with unplaced cards.Then you can select the Filter option.Examples:
Select all double lessons:
Select all seminars/course that have at 3 sections:See also:
How can I test just some lessons, for example all double lessons or all PE lessons

---

## What happens when I change school type?

_u1/u3/u65/t1022_

You can change the school type combo box. Standard – uses group based generator. If you have inputted students they must be assigned to the seminar groups(sections) before the generation and they remain in the assigned group during the generation.Timetable based on students picks (Master) – shows all courses in one row, regardless of grade. This option uses high school generator that can move students between sections during the generation.Timetable based on students picks (Classes/grades) - This view displays one row for each class(grade). This option uses high school generator that can move students between sections during the generation.

---

## What does the stripes on the cards mean?

_u1/u3/u65/t1026_

The software might show stripe of varios color on card to indicate:White stripe – cards that are placed but they do not have a classroom assigned yet
My lessons are not placed in classrooms/Adding classrooms into created timetableRed stripe - placed a card in a not allowed position 
Time-offPurple stripe - visual indications for cards that are over capacity
Max students for certain seminar lessonBlue stripe - this subject has some pending students
Pending students viewSmall stripe in the lower right corner - locked cards
Locked cards

---

## Hotkeys

_u1/u3/u65/t118_

F5 starts timetable generation
Space Bar shows timetable verification
CTLR-L - compare with last saved versionNumpad shortcuts:
+ zoom into the timetable
- zoom out
/ Fit Zoom
* Invert colors on the screenMultiple week timetables:
Number 0 - show summary of all weeks
Numbers 1-8 - show week 1-8
Ctrl-0 show all weeks expandedMouse Shortcuts:
CTRL+LEFTCLICK - if the class is divided into groups, CtrlClick will pick all groups on this position. In case of clicking on the empty position CtrlClick will place all the groups. When working with divided lessons, this can be extermely usefull. 
Note that this is sometimes not possible, since the complemetary teacher may not teach at that time. 
SHIFT holding shift while moving card will show the time-off of the card below the cursor instead of the card you have in hand. So you can check where you can put the card below the cursor before you actually replace it with currect card on your hand.

---

## Related timetables

_u1/u3/u65/t288_

You may activate the function "related timetables" in menu View - Related timetables. You may use the shortkey Ctrl+R.A new lightgrey panel will display above the timetables::
This panel shows timetables related to the card you are currently holding. You can place the card directly into panel related timetables. After placing this card the timetables related to this last card stays displayed. It is possible to take the card to your hand also from the related timetables.You can set the maximum number of related timetable row in menu View/Related timetables.Note: By holding SHIFT key you can display timetables related to the card under the cursor or under the currently held card. Note 2: It is possible to lock some rows in related timetables by clicking on row header. Locked rows will stay there even if they are not related to current card.

---

## Comparing timetables

_u1/u3/u65/t271_

There are two options how to compare your timetable files. You may find both in menu File - Compare.
"Compare with last saved version" - it will compare your current timetable (the one you are currently working on) and its status on disk (that is the state when it was opened or last saved). It can be useful especially when you make some changes manually and you want to see what you have changed since last save. "Compare with another file..." - this function will offer you to choose another timetable file and then it will compare it with your current timetables. After invoking this function program will veil current timetable and will highlight only those cards which are on different position in timetable you are comparing it with. In bottom of screen you will see list of changed items:
Note: Both functions will display just the changes in cards positions and names of subjects/classes/teachers/classrooms. It will not show you changes in constraints.

---

## Changing the look of the timetable on the screen

_u1/u3/u65/t307_

This article is about changing the look on the screen.Go to menu View/Define:.
If you for example choose color by buildings you can quickly see when the studetns are in 1st and when in 2nd building:
You can also change the texts that shall be displayed on the screen. In some cases you want to see teacher instead of clasroom etc.Note: you can fully customize the prinouts in the print preview mode. Customizing printouts

---

## Why are all new lessons placed on Wednesday?

_u1/u3/u65/u4890_

It can happen, that by mistake you have selected, that default day for each new lesson shall be specific day - e.g. Wednesday.
This can be changed in menu "Options - Customize the stoftware - User interface - Default values". Then from the drop down menu select the option "Lesson can be on any day (X)".

---

## Search field - Timetables online

_u1/u3/u65/u8770_

The search field is located in the top-left corner. As you type, the program automatically displays all items containing the entered text. Using search, you can quickly find any object in the timetable and immediately use the available quick actions, such as edit, timetable view, time-off, or constraints settings.
