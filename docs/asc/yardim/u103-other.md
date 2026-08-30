# Other

aSc Timetables yardım belgelerinden alındı (8 konu).
Üreten: `node scripts/asc-yardim.mjs`

---

## Swap two days in timetable

_u1/u3/u103/t735_

Let's suppose that you have finished the timetable and suddenly, due to some reasons, you just need to swap two days. It means that you want to move all cards from one day to another and vice versa. You can do this in menu "Options - Advanced". If you wish to swap e.g. Monday (1st day) with Friday (5th day), type the following command in Advanced field:!swapdays 1 5Then click OK. Program will automatically swap all placed cards between these two days. Note: Program will swap only placed cards between selected days. Cards in remaining days will be untouched and also this command will not change the Time-offs.

---

## Delete all unplaced cards

_u1/u3/u103/t737_

If you have nearly finished your timetable, but there are still some cards that are not placed in timetable and you want to remove all those cards from timetable completely, you can do it this way:Go to menu Options -> Advanced. Type following in the Advanced field:!deletependingcardsThen click OK. 
Note:
All already placed cards will stay. Program just change the definitions of the lessons for classes and teachers in a way that there will be no unplaced cards, so basically decrease the counts of periods per week.

---

## I need to move all lessons within a day

_u1/u3/u103/t751_

move lessons, advanced functions

You have to go to menu Options - Advanced.Then click button Move lesson.A dialog appears where you can input two parameters:
1. Choose if you want to move lessons UP or DOWN. UP means lesson 1 will become 2, 2->3 and so on.2. The lesson number from which you want to make the move. If you want to move all lessons type 0. If you type for example 3 then lessons 1 and 2 will stay on the same position. However lessons above 3 will move: 3->4, 4->5 and so on. This will essentially create a free lesson on position 3.

---

## How can I swap all the lessons from one period to another

_u1/u3/u103/t1080_

Once you generate your timetable and wish to just swap lessons between periods, it is not necessary to do it manually "one-by-one" card. It is convenient to use advanced function "!swapdpd". If, e.g. you wish to swap second period in Monday with fifth period in Tuesday you can do so in the menu Options - Advanced and type following in Advanced field:!swapdpd 1 2 1 2 5press OK. 
This will swap:
from
1 - 1st day in the timetable (so Monday in our case)
2 - 2nd period
1 - copy 1 period (2 would copy 2 periods, and so on)
to
2 - 2nd day the timetable (Tuesday)
5 - 5th period Note: 
In case, that there are longer lessons (double, tripple, ...) in area you wish to swap, this function will move just those long lessons, which starts on specified periods.

---

## Local backup

_u1/u3/u103/t936_

Everytime you save your file and once every 30 mins you are working on some file, it's copy is saved to the local backup storage on your PC.In case you loose your file, or it gets damaged or you accidentally overwrite it with wrong data, you can just go to "File"-"Open from local backup" . Then choose previous version of your file from the list of backups.

---

## Timetable files - making backups, problems opening files, etc...

_u1/u3/u103/t721_

aSc Timetables stores its data in .roz files. Working with these files is sthe same as with Microsoft Word .doc files.You can save your current timetable to new file (with different name) via menu File/Save as.To transfer this file to other computer, you can copy it to USB disk, burn it on CD, or send it via email.You can also have as many timetable files on your computer as you wish. You can save multiple versions of your timetable with different filenames.Problems with fileI can't open the file: If program reports that file was created in newer version of aScTimetables, please download and install latest version from our web site. If program crashes, please send us your timetable file by email to support@asc.sk and we will check what can be the problem. Usually it is a disk problem and your file was damaged.I can open the file, but there are some data missing in it: In most cases, you have just opened a wrong file. Please find the correct version of file. Or you have forgotten to save file last time you have been working on it. Or it might be possible that you have accidentally overwritten your file with older version. If you can open the file, but some data is missing in it, then these data are either lost, or in some other data file.I can't find my file: Please check some typical location where the file can be: Desktop, My Documents folder, some drive of your computer, or your USB disk. Or consult some computer experienced person on your school to help you find the file on your PC.

---

## Why there are questionmarks in my timetable?

_u1/u3/u103/t1284_

If you see your timetable as follows: 

problem is, that you are trying to display count of students on each card, while there are no students inputted in your Timetable, or there is no such information in divisions for classes.This can be solved by change of displaying your timetable as "Standard"
See also: 
Number of students in class and groups

---

## Add timetable to your calendar application (Google calendar, Outlook, iPhone calendar...)

_u1/u3/u103/t1078_

With Timetables Online you can add events from your school's daily plan to your calendar application. You can find this function after you login as teacher in "Settings" - "Other" - "My profile":iCalendar file (ICS)
With this function you can simply download your current daily plan as ICS file, which you can add to your favorite calendar application. Please note that this will download only current daily plan data - if there are some changes to data (e.g. due to substitution or change of the timetable) you will need to download the calendar again.Better solution is to use Webcal.Webcal
To activate Webcal, simply click on "Enable Webcal" button. Timetables Online will generate unique URL address for you calendar, which you can add to your calendar application, like Google calendar, Outlook, iPhone calendar (see instructions below), Mozilla Thunderbird and others...Hint: If your computer is properly configured to handle "webcal://" links, simply click on "Webcal" text to the left of the address to open it in your calendar application.Add calendar to iPhone/iPad
In Safari, login to your school's regular page (not mobile page). Go to "My profile" section, enable Webcal calendar and then click on "Webcal" link to the left of URL adress. When system asks you "Subscribe to the calendar XXX?" click "Subscribe".Notes:
Privacy - Keep your calendar URL address private. Anybody who knows this address can see your calendar events. If you think your address was compromised, click "Reset URL" button to generate new address (and invalidate old one).Refreshing - It takes some time till changes to calendar are transferred from Timetables Online to your calendar application. To speed-up this process for recent changes, you can click on "Refresh" button. This will immediately regenerate your Webcal calendar data in Timetables Online. But this button will not force your calendar application to re-read the data immediately. Please refer to documentation of your calendar application how to force re-read of the calendar data from Webcal calendar.Date range - Calendar is always generated for past 7 days, today and future 30 days.
