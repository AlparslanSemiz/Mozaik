# Exporting and Importing

aSc Timetables yardım belgelerinden alındı (14 konu).
Üreten: `node scripts/asc-yardim.mjs`

---

## Can I export the lessons, teachers, subjects to MS Excel?

_u1/u3/u64/t420_

You can export the data you have inputted to MS Excel.Choose menu File/Export/Export to MS Excel:

The following dialog appears. You can select what you want to be exported:
The most usefull is probably to export contracts. This export all the data into several sheets for each list. Please note that there are several sheets:
Notes:
- you can import these exports back to aSc TimeTables. Check this article Importing from Clipboard (MS Excel)

---

## Export to XML

_u1/u3/u64/t699_

This topic is for IT personnel of your school. It requires basic software programming skills.Please see this topic for simpler way of exporting data from aSc Timetables:
Can I export the lessons, teachers, subjects to MS Excel?See also:
Export limited to max 10 cards/lessons
Import from XMLaSc Timetables can export data into "aSc Timetables XML" file. There are 3 types of export1) Default export - exports only basic data
2) Configured export - here you can configure what will be exported.
3) Combined import/export file.Default export
You can do default XML export from aSc Timetables by invoking command menu - File - Export - aSc Timetables 2012 XML. Select destination for export and click OK. Program will export timetable data in default data structure. This default data structure is similar to internal structure of aSc Timetables. It contains only a basic data. Also all ids used in this export are just Random internal IDs. These ids may change over the lifetime of timetable (they are not persistent, they can change e.g. when users add/remove some objects from timetable or change their values).If you need to export some additional data not present in default export, you need to use configured export:Configured export
For configured export, you need XML export configuration file. This file contains description of data structure in which you want to get data exported from aSc Timetables. It can also include your "idprefix:" option, so you will get your ids exported instead of internal ids (if the data were originally imported from your system).Export configuration files are stored in C:/TimeTables/template/xmlexport directory. To invoke configured export, go to menu - File - Export - Name of your export (displayname).You can find sample export configuration file here:C:/TimeTables/template/xmlexport/sample.xmlThis is just a sample. You can choose any tables/columns you wish. Don’t forget to configure idprefix option (if you need to get your ids). Also fill displayname (=name of menu item in aSc Timetables export menu) and displaycountries (=comma separated list of Internet country codes). Rename the file to “program_cc.xml”, where “program” is name of your software and cc is country code of your country. When you have this file finished, email it to us and we will include it in standard installation of aSc Timetables.Note: XML export configuration file is something like "blank database". It contains only tables and column definitions, but usually there is no data in these tables.Please see Import from XML on how to enhance XML file with new tables/columns.Creating combined XML import + XML export configuration file
It is also possible to combine XML import with XML export. This might be useful e.g. if user is required to input subjects/teachers/classes in your system, but he inputs the lessons in aSc Timetables. In this case you don't need to export subjects/teachers/classes from aSc Timetables. You need just to link subjects/teachers/classes in aSc Timetables to corresponding objects in your system. But you need to export lessons.You can find instruction how to implement this here.If you have some questions regarding XML import/export, please write to support@asc.sk.

---

## Export limited to max 10 cards/lessons

_u1/u3/u64/t713_

IMPORTANT:
This help is only valid for PC version. The TimeTables online version doesn't have limits. Save your timetable to online version and export:
How can I save my timetable to online storagePC windows version:
In some export functions (e.g. Export to XML), there is a limit of maximum 10 cards or 10 lessons. To bypass this limit, you will need a special registration code for one computer only. If you are registered user of aSc Timetables, you can get this code for free. You can ask for it via email to support@asc.sk. 
Please provide us with the following data:1) Your current registration name
2) Your computer licenseYou can find both values in menu Help -> Info.Note: You will have to register program with this new registration code then. Do not worry, you will not lose your data, but keep in mind, that it will be valid for this one single computer only. 
How to register the software?

---

## Importing from Clipboard (MS Excel)

_u1/u3/u64/t351_

Import from clipboard is useful tool which you can use to import your data from almost any other program. These steps will describe how to transfer data from MS Excel but same method can be used with other programs too. (If you are building student based timetable check this article:
Import sections from clipboard(Excel) )In this article we will show how to import data from this excel file into aSc TimeTables. Please note that this file contains all the information, your file may contain only subjects, or only teachers. 1. Open aSc TimeTables and create a blank document.2. In MS Excel select the first sheet with classes and copy in to the clipboard(CTRL-C or menu edit/Copy)
3. Switch to the TimeTables and choose menu File/Import/Import from Clipboard
4. Dialog shows up that shows the selected data in the list. If the list is empty then you have not copied the data into cliboard so return to Excel and copy them as in step 2.5. Select 'Lessons' in the upper combobox, because we want to import the lessons first.
6. Check the checkbox "First row contains column headers" or click on each column header and specify what the column means. 7. Once you have specified a meaning for each column, click the buttom 'Import'.Note that the software will create also teachers, classes, subjects if they are not yet in the timetable.
Alternativelly you can use the same steps as described above and import teachers or classes before lessons. This way you will be able to specify name and also short name for each object. Then later when importing lessons the software will not create new teachers, but will use the onces you imported previously.

---

## Synchronization with database

_u1/u3/u64/t550_

aSc Timetables can synchronize (import or export) its data with database of some partner school administration software (or other timetable files). Please contact us at info@asc.sk if your school administration software can not communicate with aSc Timetables.Following dialog may be displayed during synchronization of aSc Timetables data with database:Note: This dialog might be shown several times during synchronization for different object types (e.g. for teachers, students, groups, ...)Dialog shows differences between data (teachers, classes, etc...) in aSc Timetables and database. Left list 1 shows data in database that is not in aSc Timetables, or that is in aSc Timetables, but is somehow different (e.g. different name, short name, etc...). Right list 2 shows data that is only in aSc Timetables, or that is different in aSc Timetables than in database. Your task here is to review or change actions 8 for each row in both lists. You can do this by clicking on buttons below. Buttons 3 will change action in database list 1 and buttons 4 in aSc Timetables list 2. Buttons 5 apply for both lists (you need to select one object in each list).Here are meanings of various actions.Add - This action will add object to other side (e.g. add new teacher from database to aSc Timetables, or vice-versa).
Delete - This action will remove selected object (e.g. remove some obsolete classroom).
Ignore - Do nothing with this object.Link - This is special action tells that selected object in list 1 is the same as selected object in list 2. This will link both objects together.Note: Some actions might be unvailable in certaing situations. For example if this dialog is shown during some import, you will not be able to fill "Delete" action in list 1, because import is not allowed to modify database.By default, program will pre-fill following actions:
"Link" for object for which it has found corresponding object on other side (based on name or internal database identifier). "Add" for all other objects in database and "Ignore" for rest of objects in aSc Timetables.When you are finished with filling of actions, click OK 6 and program will carry these actions for you. You may also click on "Skip" 7 to skip this synchronization step and proceed with other object type (e.g. if you wish to import only lessons, click skip until you get to list of lessons).

---

## Import from XML

_u1/u3/u64/t690_

This topic is for IT personnel of your school. It requires basic software programming skills.Please see this topic for simpler way of importing data into aSc Timetables:
Importing from Clipboard (MS Excel)aSc Timetables can import data from "aSc Timetables XML" file. You need to write your data into this format. There is a sample XML import file included in installation of aSc Timetables:c:\TimeTables\template\Import Samples\XML\import_basicdata.xmlThis XML file is quite simple and contains import of just very basic data about classes, subjects, teaches and classrooms. It is a good start with implementing export from you school's system into this format.Note: To create new timetable file from XML data, first click on "Create new timetable" and then go to menu - File - Import - aSc Timetables XML.Note2: you need to replace "MyApp" in first row with name of your system (use only letters/spaces).It is possible to enhance this import in two ways:1) You can add new columns to existing tables in XML file
2) You can also add new tables to import some other data (e.g. lessons).Adding new columns into XML file
As an example, we can enhance XML import with class teachers for classes.In documentation (see link at bottom) you can find that column for class teachers is in table "classes" and it is called "teacherid". We have to add "teacherid" to list of columns in attribute columns="id,name" of XML node "classes". Also for each class we need to add teacherid="xxx" attribute. So the resulting XML might look like this (only classes part is shown here):

<classes options="" columns="id,name,teacherid">
<class id="1" name="5.A" short="5.A" teacherid="1"/>
<class id="2" name="5.B" short="5.B" teacherid="2"/>
</classes>

This way you can enhance import with any number of columns you need (e.g. colors for teachers, gender, time-off, etc...). Full list of supported columns can be found in documentation.Note: It is also possible to import up to 3 custom fields for teachers, classes, subjects and classrooms. In this case you have to also add name of custom fields to attribute options="". Example:

<teachers options="customfield1:Email" columns="id,name,short">
<teacher id="1" name="Bacova" short="Bc" customfield1="bacova@myschool.net"/>
<teacher id="2" name="Belicova" short="Bl" customfield1="belicova@myschool.net"/>
<teacher id="3" name="Benkova" short="Be" customfield1="benkova@myschool.net"/>
</teachers>
Adding new tables into XML file
As an example, we can enhance XML file with import of lessons.In documentation (see link at bottom) you can find that there are several tables for this purpose. We will choose "classsubjects" table and import classes' subjects, their count per week and teacher. For this purpose, we have to add this section into XML:
<classsubjects options="" columns="classid,subjectid,periodsperweek,teacherid">
<classsubject classid="1" subjectid="1" periodsperweek="5" teacherid="1"/>
<classsubject classid="1" subjectid="2" periodsperweek="3" teacherid="2"/>
<classsubject classid="2" subjectid="1" periodsperweek="5" teacherid="1"/>
<classsubject classid="2" subjectid="3" periodsperweek="4" teacherid="3"/>
</classsubjects>
This way you can enhance with any number of additional tables from list of all possible tables. Full list of supported tables and their columns can be found in documentation.Documentation
Here you can find complete documentation to XML structure.Note: If you have some question regarding XML import, please write to support@asc.skSee also: Export to XML

---

## ID numbers in import/export

_u1/u3/u64/t1052_

What does asterisk in ID number means?
When exporting from aSc Timetables to XML file, you may get exported id numbers looking like *1, *2, *3. These are so called "temporary id numbers". These numbers are assigned during export to objects that do not have any id number assigned yet. They are called "temporary", because they are valid only during one particular export. When you export same timetable next time, you may get different temporary id for the same object exported.These temporary ids are needed to provide links between rows in tables, e.g. lesson row can link through temporary id in "teacherid" column to table of teachers.If you want to get some real id numbers exported, you need to configure so called "idprefix".IDPREFIX - How to specify where aSc Timetables should store your id numbers?
When creating XML you wish to import to aSc Timetables, you must fill in global option "idprefix". Example:<timetable importtype="database" options="idprefix:MyApp" displayname="MyApp sample XML configuration" displaycountries="us">Id prefix option specifies where should aSc Timetables store your id numbers. In the above example, your id numbers will be stored in custom field called "MyApp ID".
See also: Custom fieldsHow to specify idprefix during export
When you use default XML export from aSc Timetables, you will always get temporary ids exported (because internally idprefix is set to %TEMPID). To specify idprefix for export, you have to create your own XML export configuration file. These files are stored in directory C:\timetables\template\xmlexport\. You can find example in sample.xml file.Special idprefix values
%NAME - id is stored in name of object.
%SHORTNAME - id is stored in short name of object.
%NUMBER - id is stored in number field of object.
%TEMPID - do not store id numbers in timetable (this is default).You can specify idprefix value also per individual tables with "idcf:" table option. E.g. if you want to store id numbers for students in "number" field, simply use:<students options="canadd,idcf:%NUMBER" columns="....">Note: There is a difference between "idprefix:" and "idcf:" when id is stored in custom field. With "idprefix:MyApp" aSc Timetables will append " ID" to the end, but with "idcf:" you need to use full custom field name: "idcf:MyApp ID".Documentation
You can find further details here. Check "Types - id", "Database options - idprefix" and "Table options - idcf".

---

## Import sections from clipboard(Excel)

_u1/u3/u64/t1090_

1. Open your excel file and select the data, then press CTRL-C:
You can use this excel file for tests, or you can add your data into this excel file. If you keep the column names, the software can recognize the columns automatically. 2. Open timetables and create a new documnent. Then go to File/Import/Import from clipboard.3. Select "Sections" and "First row contains..":
4. Press Import.Notes:
- if your timetable already contains teachers, courses, classes etc, the import will try to match them. If the corresponding object is not found, the import creates it.
- if you want to import Terms/Weeks/Days, you will need to create these prior to importSee also:
Import students' course(seminar) selections from clipboard(Excel) - Method 1
Import students' course(seminar) selections from clipboard(Excel) - Method 2

---

## Import students' course(seminar) selections from clipboard(Excel) - Method 1

_u1/u3/u64/t1092_

1. Open your excel file and select the data, press CTRL-C:
You can use this excel file for tests, or you can add your data into this excel file. If you keep the column names, the software can recognize the columns automatically. 2. Open timetables and open your timetable file or create a new one. Then go to File/Import/Import from clipboard.3. Select "Students" and "First row contains...":
4. Press Import.Notes:
- if your timetable already contains students classes, courses the import will try to match them. If the corresponding object is not found, the import creates it.
- you can click on column headers in case your excel has different column namesSee also:
Import sections from clipboard(Excel) 
Import students' course(seminar) selections from clipboard(Excel) - Method 2

---

## Import students' course(seminar) selections from clipboard(Excel) - Method 2

_u1/u3/u64/t305_

Instead of manually inputting it is possible to import the students and their seminar choices from program MS Excel. Just select your excel data and copy them to the clipboard.Data for import must be exactly in this format.
Take care to stay in the correct structure of the first three columns (the third column must be empty).
Use the exact names of objects and classes as specified in the program.
If you are using more groups in the seminar, the number 1 and 2 specifies the group of your students in this seminar.Then you can press button Import in menu Specification/Seminars:
Notes:You can click the column header to specify that the column holds student names or class names in case the software hasn't autodetected them correctly.The software will even add subjects, classes in case they are not yet inputted in the software. You may find a sample table also here. See also
Import students' course(seminar) selections from clipboard(Excel) - Method 1
Import sections from clipboard(Excel)

---

## How to merge two timetable files into one

_u1/u3/u64/t1118_

1. Open the first timetable.
2. Select menu File/Import/aSc TimeTables:

3. Browse for the second file.Now if the teacher's, subjects are named the same in both files the software will automatically link these. If ther are named differntly, you will be able to specify if a new object shall be added or you can select one of the existing objects to link with:
See also:
Synchronization with database

---

## How can I export timetables to Excel or HTML

_u1/u3/u64/t985_

Before attempting to export your timetable make sure that the desired timetable is already stored in the Online timetables.
How can I save my timetable to online storageLogin to your web site for Online timetables. Then choose Education - Timetable .Then click on "Administration" and Window with timetables will appear. Click on a row in the table to select the timetable you want to export. Then at the top of the window, from the menu select "Export".This will open a new window, where are the settings for the export of a timetable.
Format: you can choose from two options (HTML or XLS - MS Excel format)
Area: select the area you want to export.
Settings: options related to the format of the timetable, you can adjust them for export if you wish.
Now you can download the exported timetable by pressing the "Download timetable" button.
Note: For XLS format, when opening it in MS Excel, you will see a prompt "You are trying to open a file in another format...", select open ("Yes").Warning: You need to have MS Excel 2007 or later for Excel export. If you are using some older version of MS Excel, you may get blank file instead of real data.
If you are using OpenOffice, choose the HTML format to download timetable. Then you may open it in Writer (with colors) or in Calc (black and white only).

---

## Export to Smartschool

_u1/u3/u64/u5142_

Smartschool

It is possible to export your timetable from Edupage - Timetables Online to Smartschool. This export will also include optional changes from Substitutions module. Before exporting, you have to publish your timetable. Please see: How can I publish the new timetable in Timetables Online administration?You can find the export function in Edupage - Timetables Online - Administration - Export - Smartschool.
You can choose date range for which you want to export data.
It is also possible to export partitions. If you want to export partititions, your group names in Edupage must match (case-insestive) with a value of some partition. There are no "partition name" fields in aSc Timetables. Instead, partition name is added based on the known partitions (and their values) from Smartschool. They are shown in the table below. 
How to export partition data from your Smartschool Platform
- Go to the “Leerlingvolgsysteem” (Dutch) / “Suivi des élèves” (French).

- Create a custom search via the magnifying glass in the top right corner.

- Select the desired criteria for your custom search. Use "Velden profiel" (Dutch) / "Champs profil" (French) and select the profile field you want to use. These profile fields are your 'partitions' in the timetable software.

- Under "Opties" (Dutch) / "Options" (French), check the first checkbox. Use the little arrow to select all desired fields you want to show (per student) in the search results.

- If you want to save your custom search, click on the blue disk at the bottom of the screen. This way, you can use the same custom search again later.

- Click on the blue button to search for results.

- Click on the Excel-icon in the top righthand corner to export the search results to an .xlsx-file.
There are some default partitions in Smartschool but you can define additional partitions by creating your own profile fields in Smartschool. If you use your own profile fields for partitions, you have to export them from Smartschool as above and load them to Edupage with "Load profile fields from XLSX".

---

## Export to iSAMs

_u1/u3/u64/u7863_

isams

You can export your timetable directly into iSAMS database. This option is available only in ASC Timetables Online. 1. Open your timetable, then select File - Export - iSAMS.2. In the next dialog you can select these options:

- First period number - this should match the PeriodID for the first period on the first day of the week in iSAMS.

- Set code mode - select what should be used for a group part of Set code. See below.

- Term - in case you have multiple terms defined in the timetable, you can select which term you wish to export.

3. Confirm your selection with OK and download the XLSX file with exported data.Set code format
Set codes for lessons consist of 3 parts and use this format:Year Subject Groupe.g.: Y10 Maths 1Description: 
- Year - This is taken from the classes' grade. You have to fill the grade for all classes in the timetable. Please see: How to specify class grade

- Subject - Abbreviation of the subject. Please see: How to add a new subject

- Group - This depends on the type of the lesson:

- Whole grade (year group) or joined entire classes - empty

- One entire class - last char of class abbreviation

- Divided class - group name (In options you can select if you want to use whole group name, or just part after dash, or just last character of group name)

Each lesson in the timetable must have different Set code, otherwise you will get "Duplicate set code" errors during the export. Usually this problem can be resolved by renaming groups so that each lesson gets different set code.Multi week timetableIf you have 2 weeks timetable, this will also be a part of the period numbering. So the total number of periods in iSAMS will be:(number of periods in day) * (number of days) * (number of weeks)If the lesson in 2 weeks timetable is defined for "All weeks" then it will be exported in 2 rows, first row with period number in the first week and second row with period number in the second week.
