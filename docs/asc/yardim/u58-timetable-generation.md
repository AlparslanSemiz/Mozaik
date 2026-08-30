# Timetable Generation

aSc Timetables yardım belgelerinden alındı (13 konu).
Üreten: `node scripts/asc-yardim.mjs`

---

## Starting the generation

_u1/u3/u58/t162_

Once you use menu TimeTable - Generate new the following dialog will appear:
If you have not yet tested the timetable, or you made a significant changes in the entered data, it is a good idea to test it every time before the generation. Just click the button Test the timetable. Why to test the timetable?If your timetable passes this basic test, then you can try to generate your timetable. You can also change the generation parameters. See these articles:
Constraints relaxation
What does the complexity of generation mean?See also:
What is cloud generator?

---

## What does the complexity of generation mean?

_u1/u3/u58/t111_

The complexity of the generation means how much time the computer shall spend checking your timetable.Normal Complexity
This option is good for initial generations, where you want to check if your timetable is good inputted and generate-able.
For many schools this option will find a good timetable and they will have no need to use more complex and usually slower generations. Large & Huge
This settings are more complex, the computer will spend more time checking your timetable. This can mean the generations will be slower. For some complex timetables it might be needed to use these complexities. Notes:
- Please see this article: A good way to generate your timetable.
- Do not forget to test your timetable before generating. Why to test the timetable?
- It is not a good idea to use large and huge settings before you are quite convinced that there are no mistakes in the basic data and you have inputted realistic constraints. See also: Analyze the timetable by Extended testsSee also:
What is cloud generator?

---

## Constraints relaxation

_u1/u3/u58/t113_

Constraints relaxation allows generator to partially violate some constraints in order to fully generate the timetable. With constraints relaxation enabled, program tries to fulfil all the constraints, but if it gets in some bigger trouble with some card, it will put it into timetable even if it means that some constraints will be broken. Of course, it tries to create timetable that most closely matches your constraints.Constraints relaxation can help you in two ways:1. It can help you with identifying what can be the problem with your timetable and which constraints are probably too hard. If you generate your timetable with relaxation turned on, there is a higher chance that timetable will be generated. Then you can check which constraints were relaxed and think if they are realistic. Or you might consider changing settings of some constraints to some easier values. 2. It can help you to find the final timetable with only some constraints relaxed.If you turn the constraints relaxation to strict, then no constraints can be relaxed and only those timetables that are fully complient with your requirements are accepted. The software will generate until it finds such, or may leave some unset cards in case such a timetable doesn't exist.See also:
A good way to generate your timetable
What does the complexity of generation mean?
Generate draft timetable

---

## A good way to generate your timetable

_u1/u3/u58/t115_

Here are some 'best practice' procedures to follow when generating your timetable:1. Test the timetable before the first generation. Why to test the timetable?2. Test the timetable after you make any big changes to the data.3. Try to generate a Draft timetable, before inputting all your constraints.
A Draft timetable will only contain the basic data(lesson). The draft timetable is good to use to check if the timetable is basically what you expect to produce; if the groups are matching etc.4. It is a good idea to allow relaxation of the constraints during the first few generations. This can give you a idea of what might be problem in your timetable. For example: if the software always relaxes the maximum number of consecutive lessons for a teacher, it is most likely the case that you will need to allow this teacher to be able to teach more consecutive lessons.5. Add constraints one by one. If you were able to generate a draft timetable then you are probably heading in the right direction. Now you can add constraints one by one, from the most important to the 'wish lists' of your teachers. So add a constraint, generate and if successful, add another. If you are not able to generate a schedule after adding some constraint it is likely that this constraint is unrealistic based on how your timetable data is currently setup.6. If needed you can raise the complexity of generation, including draft generations. However, only do this if you are confident that the software understands what you want. That is at this complexity have you been able to generate drafts or previous timetables at this level of complexity.7. Repeat steps 4,5,6 until you find a timetable you are fully happy with. The good thing about this approach is that you usually end up with a timetable that can be used even if the generation with added constrains produced no results. 8. At some point you might try to turn off the relaxation of constraints and accept only the timetables with no relaxations. Or, if this isn't working for you, you can continue with relaxations and accept the timetable with a few relaxed constraints. Notes:a) Sometimes it might be necessary for the generation to take many hours. However it is best to only do this if you are in the later stages of generation. ie) you have already generated some schedules and you are adding new constraints.b) We recommend that you do not input all the constraints you might think of to start with and then generate for 10 hours, for example. Rather it is better to follow the above approach (draft and then add constraints one at a time)c) We can always assist you if you have problems with the generation of your timetable. Just contact us by using the red question mark (Don't forget to describe your problem so we are better able to help you).See also:
Starting the generation
What does the complexity of generation mean?
Constraints relaxation

---

## What does the dialog displayed while the generation is in progress mean?

_u1/u3/u58/t109_

This dialog is displayed during the whole generation and shows you the progress of your generation:
1. progress bar shows the total number of cards in the timetable. It also shows how many cards the software was unable to put into the timetable. If the generation algorithm was not able to put some cards into the timetable the color of this bar changes and the total number of unplaced cards is shown. For example 3/768. The generation continues, however you might consider to stop it, try again and/or relax some constraints. 2. this progress bar shows how many timetables per second the computer can check. This number is just informative, no real value.3. this bar shows how many constraints were relaxed, if you have allowed the constraints relaxation. If this number gets higher than you expect you can stop the generation and immediatelly run the verification(press SPACE). That will show which constraints were relaxed. It can give you a clue what the software had problems with and you can react. More on relaxing constraints can be found it this chapter Constraints relaxation.4. The total progress. Your aim is to get this to the most right. However as you can see, if the generator cannot continue in the chosen direction, it can even go back, throw a few cards out of the schedule and try some other way. This is very similiar to how humans would do it manually. Note: the complexity of generation more or less means how stubborn the generator is, how much effort it will put into investigating each possibility before trying another way. More on complexity in this chapter What does the complexity of generation mean?.5. This bar shows some local progress in investigation inside the current path. If the progress goes to the most right, it concludes the current direction is wrong and goes back to check something different.6. The graph shows you the history of the total progress (point 4). Also please notice the small green vertical bar at the left area of the graph. This green bar shows the maximum achieved progress. What can you learn from this graph? If the green vertical bar is near the top, it means that at some time during the generation, only a few cards were left. This is a good sign that the generation will be succesfull. On the other hand if the bar is at 10% and the graph shows a flat line, the generator is trying to solve some group of cards at the very beginning. It might be a good idea to check what is that group and try to generate only this group. However sometimes it might be necessary to wait and give the algorithm some time to find the solution.7. the current card that the computer is trying to place into the timetable. Note that there is lifebar at the top of the card. If this lifebar gets red, it means there were many unsuccesfull attempts to generate this card and if there are a few more, this card will be left out of the generation.Hints:a.) Please check the chapter A good way to generate your timetable.b.) You can generate more timetables on one PC, you just have to run multiple instances of the software at one time. Or you can generate a timetable and check some other variants in the second instance of aSc TimeTables.

---

## Generation has finished and the program tells me it had to relax some constraints.

_u1/u3/u58/t164_

In case you have allowed constraints relaxation before the generation it is possible that you will see this dialog at the end of the generation:
What does it mean?
It simply means that computer was able to put all lessons into the timetable but it had to relax some of your constraints. If you click the "Show me..." button the software will show you list of the constraints that it had to relax. You can check if the constraints that were relaxed are realistic. Also please check these articles:Constraints relaxation
What does the complexity of generation mean?
A good way to generate your timetable

---

## Can I force the generator to place certain lesson on certain position?

_u1/u3/u58/t255_

You can place the lesson into the timetable before the generation and then lock them. The generator will not move the locked cards. Locked cards are marked with small stripe in the lower right corner:
If you click right mouse button you can specify also the clasroom for this lesson:
IMPORTANT: try to avoid locking lessons unless really necessary. It is better to specify the timeoffs for teacher, classes, subjects etc. If you lock many cards you can make the timetable impossible to generate. Sometimes one card locked on unlucky position can spoil the whole timetable.

---

## Multiprocessor generation (dual-core...)

_u1/u3/u58/t505_

Some of modern PC computers contain special kind of processor called DUAL-CORE processor (or multi-core). Processor is central part of computer that does most of the computation. In case of dual-core processor computer, this processor "contains" two separate processors inside, so it is theoretically capable to do twice as much work in parallel.Generator in aSc Timetables is capable to utilize this additional computing power. All you have to do is leave checkbox "Enable multiprocessor generator" 1 checked.This checkbox is visible only on dual-core (multicore, or multi-cpu) computers and is checked by default.From our measurements, multiprocessor generator on dual-core computer runs cca 50% faster than single processor version.When to disable multiprocessor generationIn some cases it is not practical to use multiprocessor generator:- if you are doing some computation intensive work on your computer while generating timetable
- if you are generating two timetables in two separate windowsIn these cases it is recommended that you will turn off multiprocessor generator.

---

## Testing was sucessfull, but the generation fails

_u1/u3/u58/t596_

1. Try to generate on higher complexity2. Try to generate with relaxed constraints to see what kind of constraints had to be relaxed, and then relax them.3. You can also try to test bigger parts of the timetable. The Test tests just one item at time, however sometimes problems are not linked just to single class/teacher, but occur when trying to generate two or more classes/teachers, whole grades, or even half of all classes, etc... 
Please see this page:
Testing multiple classes/teachers at onceSee also:
A good way to generate your timetable

---

## What happens when I cancel the generation?

_u1/u3/u58/t1028_

The standard generator generates until it places all the cards into the timetable. If you have relaxation allowed it generates until all cards are placed, but may need to break some constraints.If you cancel the generation you have two options. Canceling immediately will stop the generator in the exactly same state it was in the moment you cancelled. So if the generator has already placed 90% card but for the last few he had to explore different possibilities, you might cancel it with just 10% cards placed. Finish quickly option will force the generator to try to place all the remaining cards, without extensive rebuilding of the timetable. This option will not give you timetable, but you will have most of the cards placed which can give you some idea on what is going on in your timetable.The student based generator works different way. Once it finds timetable, the button bellow changes from cancel to stop. It still tries to find better solution (usually this means less students choices unrealized). It will stop after reasonable time (defined by the complexity of generation) but you can stop it at any time and the software will show the best solution so far.

---

## Cloud generator

_u1/u3/u58/t1294_

Cloud generator uses both your PC and our cloud servers to help you generate your timetable. The cloud generator is especially useful if you are not sure how to generate your timetable, what parameters to use or if you simply have a very complicated timetable. The cloud generator has generated many timetables and can use the gathered expertise also in generating your timetable.How to use it? Simply press Start:
The cloud generator will immediately start working. It will show you how many timetables it has checked.As soon as it finds the solution, it will stop and give you that timetable.If however it takes longer or it finds some issues, it will report anything it finds into the same window:
Cloud generator in endless mode
Endless mode will instruct the cloud generator to work until it finds a solution - or until you stop the cloud generator. If you have time (overnight, weekend) use this option:
During the generation the cloud generator will show you the best timetables found so far. You can click on these at any time and to review them. This will not stop the generator, it will continue working.The cloud generator will show you both the best timetable with relaxation allowed and without the relaxation allowed:
The cloud generator will stop as soon as it finds a solution with all lessons placed and no constraint relaxed. If you close it, it will offer you to save the best timetables found during the generation.See also:
What to do after the generation relaxed some constraints?

---

## Checking and generation

_u1/u3/u58/t484_

After you enter basic data, you can generate the timetable. Just press button "Generate" to generate the timetable and finish the wizard:The generation dialog will suggest you to test the timetable before the generation. A good idea can be to check help topics explaining the generation:
Starting the generation
and
A good way to generate your timetableIf you still haven't done so, we advise you also to check the Tutorial:
Checking the tutorial in the Offline version

---

## Improve functions

_u1/u3/u58/u5081_

After changing constraints or adding new requirements, you may want to improve an already generated timetable. The recommended way is usually to generate a completely new timetable, because even a small change can significantly affect the overall timetable structure.To improve an existing timetable, use Timetable → Improve. The dialog offers several options:Real Generation
Creates a completely new timetable from scratch. This is the recommended option in most cases, as the generator can take all constraints into account from the very beginning and find the best overall solution.Add Unplaced Cards Only
The software will only try to place lessons that are currently unplaced. Existing lessons will not be moved and already broken constraints will not be repaired.Safe but Limited Generation
The software attempts to improve the current timetable while always keeping it complete. Since lessons are never removed from the timetable, the algorithm has fewer possibilities to explore alternative solutions. This option is useful when a full regeneration is not desirable.Safe Generation That Can Break New Constraints
This mode tries to improve the timetable quality even if it needs to break some lower-priority constraints in order to satisfy more important ones. The software evaluates both the number and severity of broken constraints. The overall quality is reflected by the Points value shown in the dialog.Notes:
- When should you use Improve? - If timetable generation normally takes only a few minutes, it is usually better to add the new constraints and perform a Real Generation. The success rate is significantly higher because the generator knows all requirements before placing the first lesson.
The improve functions are mainly intended for large and complex timetables where a complete regeneration may take a long time. In such cases, they allow you to test additional requirements or gradually improve the timetable without losing the current solution.-The improve functions never remove lessons from the timetable. This means the timetable remains complete throughout the entire process, which is often convenient. However, this limitation also means that some problems cannot be solved without rebuilding larger parts of the timetable.
Therefore, Improve should be viewed as a tool for refining and polishing an existing timetable, not as a replacement for generating a new timetable. If significant changes are required or several constraints are broken, a new generation will usually produce better results.
