import {Shell,HOME,tokenize} from './engine.mjs';
const exists=(s,p,type='f')=>s.fs[HOME+'/'+p]?.type===type;
const contents=(s,p)=>s.fs[HOME+'/'+p]?.text;
const read=(s,p)=>s.events.some(e=>e.type==='read'&&e.path===HOME+'/'+p);
const commands=s=>s.events.filter(e=>e.type==='command'&&e.ok);
const pathAt=(s,raw,cwd)=>{const previous=s.cwd;s.cwd=cwd;const result=s.path(raw);s.cwd=previous;return result;};
const task=(id,title,goal,hint,solution,check,vm)=>({id,title,goal,hint,solution,check,vm:vm||goal});
export const TOPICS=[
 {id:'basics',label:'Command basics',short:'01',desc:'Read the prompt. Identify the user, computer, and current directory.',lesson:'A terminal accepts text commands. The shell interprets them. In student@linux-practice:~$, student is the user, linux-practice is the computer, and ~ means the home directory. Type the command after the prompt; do not copy the $ symbol.',example:'whoami\nhostname\npwd',terms:['whoami','hostname','pwd','man','help'],tasks:[
 task('identity','Identify your workstation','Run commands that display your username, the computer name, and your current directory.','Use whoami, hostname, and pwd.','whoami; hostname; pwd',s=>['whoami','hostname','pwd'].every(c=>commands(s).some(e=>e.args[0]===c)),'In your CYBER.ORG VM, run whoami, hostname, and pwd. Record the real output. It may differ from this practice terminal.'),
 task('help','Use a reference','Open the manual for ls. Then list the entries in your home directory.','man takes a command name as its argument.','man ls; ls',s=>commands(s).some(e=>e.args[0]==='man'&&e.args[1]==='ls')&&commands(s).some(e=>e.args[0]==='ls'&&e.cwd===HOME)),
 task('commandparts','Try an option','List your documents directory in long format.','The -l option changes the display.','ls -l ~/documents',s=>commands(s).some(e=>e.args[0]==='ls'&&e.args.some(v=>v.startsWith('-')&&v.includes('l'))&&pathAt(s,e.args.slice(1).find(v=>!v.startsWith('-'))||'.',e.cwd)===HOME+'/documents')),
 task('returnhome','Return home','Go to /tmp. Then return to your home directory and display its path.','cd with no argument returns to your home directory.','cd /tmp; cd; pwd',s=>s.cwd===HOME&&commands(s).some(e=>e.args[0]==='cd'&&pathAt(s,e.args[1]||HOME,e.cwd)==='/tmp')&&commands(s).some(e=>e.args[0]==='pwd'&&e.cwd===HOME))
 ]},
 {id:'navigation',label:'Navigation & paths',short:'02',desc:'Move through folders and locate hidden files.',lesson:'A path beginning with / starts at the filesystem root. A relative path starts in your current directory. .. means the parent, . means the current directory, and ~/documents expands to a location inside your home directory. Names are case sensitive. ls -a includes dotfiles.',example:'cd documents\nls -a\ncd course\npwd',terms:['pwd','ls','cd','find'],tasks:[
 task('locate','Find and read a file','Locate schedule.txt inside your home directory and display its contents.','Explore with ls and cd, or locate the file with find. Read it with cat.','find ~ -name schedule.txt; cat ~/documents/course/schedule.txt',s=>read(s,'documents/course/schedule.txt')),
 task('relative','Follow a relative path','From your home directory, enter documents/course using a relative path. Display the directory path.','Use cd documents/course, then pwd.','cd documents/course; pwd',s=>s.cwd===HOME+'/documents/course'&&commands(s).some(e=>e.args[0]==='cd'&&e.args[1]&&!e.args[1].startsWith('/')&&!e.args[1].startsWith('~'))&&commands(s).some(e=>e.args[0]==='pwd'&&e.cwd===HOME+'/documents/course')),
 task('hidden','Find a hidden file','Find the hidden welcome text file inside documents and display its contents.','ls -a displays filenames that start with a dot.','ls -a documents; cat documents/.welcome.txt',s=>read(s,'documents/.welcome.txt')),
 task('parent','Move up one level','Enter documents/course, move to its parent using .., and finish in documents.','The parent of course is documents.','cd documents/course; cd ..',s=>s.cwd===HOME+'/documents'&&s.history.some(h=>h.includes('cd ..')))
 ]},
 {id:'files',label:'Files & directories',short:'03',desc:'Create, copy, move, rename, and remove.',lesson:'mkdir creates directories. touch creates a file if it does not exist. cp copies and keeps the source. mv moves or renames. rm deletes files; rmdir removes empty directories. Run pwd and ls to check your location before changing files.',example:'mkdir practice/example\ncp documents/course/notes.txt practice/example/\nls practice/example',terms:['mkdir','touch','cp','mv','rm','rmdir'],tasks:[
 task('create','Build a folder','Create a folder named work in your home directory and an empty file named todo.txt inside it.','Create the directory before the file.','mkdir ~/work; touch ~/work/todo.txt',s=>exists(s,'work','d')&&exists(s,'work/todo.txt')&&contents(s,'work/todo.txt')===''),
 task('backup','Copy and rename','Create ~/backup. Copy documents/course/notes.txt into it as notes-copy.txt. Preserve the original.','cp accepts a destination filename. You can also copy first and then rename with mv.','mkdir ~/backup; cp ~/documents/course/notes.txt ~/backup/notes-copy.txt',s=>contents(s,'backup/notes-copy.txt')===s.initialNotes&&contents(s,'documents/course/notes.txt')===s.initialNotes),
 task('move','Move a file','Move downloads/colors.txt into practice and rename it palette.txt.','mv source destination moves and can rename in one command.','mv ~/downloads/colors.txt ~/practice/palette.txt',s=>!exists(s,'downloads/colors.txt')&&contents(s,'practice/palette.txt')==='blue\nred\nblue\ngreen\n'),
 task('cleanup','Remove working copies','Copy notes.txt into practice as temporary.txt. Display the copy, then remove it. Keep the original.','Use cp, cat, and rm. The checker also looks for the read step.','cp documents/course/notes.txt practice/temporary.txt; cat practice/temporary.txt; rm practice/temporary.txt',s=>read(s,'practice/temporary.txt')&&!exists(s,'practice/temporary.txt')&&contents(s,'documents/course/notes.txt')===s.initialNotes)
 ]},
 {id:'reading',label:'Read & edit text',short:'04',desc:'Inspect contents and make a small text file.',lesson:'cat prints a whole file. head and tail show the first or last lines. Use -n to choose how many. wc counts lines, words, and bytes; wc -l counts newline characters. nano opens this site’s practice editor. Its buttons replace the real nano keyboard interface.',example:'head -n 2 documents/course/schedule.txt\ntail -n 2 documents/course/schedule.txt\nwc -l documents/course/schedule.txt',terms:['cat','head','tail','wc','nano'],tasks:[
 task('firstlines','Read the beginning','Display only the first two lines of documents/course/schedule.txt.','head -n 2 FILE selects two lines.','head -n 2 documents/course/schedule.txt',s=>s.events.some(e=>e.type==='head'&&e.path===HOME+'/documents/course/schedule.txt'&&e.n===2)),
 task('lastlines','Read the end','Display only the last two lines of documents/visits.log.','Use tail with a line count.','tail -n 2 documents/visits.log',s=>s.events.some(e=>e.type==='tail'&&e.path===HOME+'/documents/visits.log'&&e.n===2)),
 task('write','Write a reminder','Create practice/reminder.txt containing the line: Check your current directory.','Use nano practice/reminder.txt or redirect echo output.','echo "Check your current directory." > practice/reminder.txt',s=>contents(s,'practice/reminder.txt')?.trim()==='Check your current directory.'),
 task('append','Keep the first line','Create practice/list.txt with two lines: Apples on the first line and Pears on the second.','> replaces contents. >> appends without replacing.','echo Apples > practice/list.txt; echo Pears >> practice/list.txt',s=>contents(s,'practice/list.txt')==='Apples\nPears\n')
 ]},
 {id:'search',label:'Search & filter',short:'05',desc:'Find files and select matching lines.',lesson:'find searches for file paths. grep searches inside text. grep is case sensitive unless you add -i. -n includes line numbers. -c counts matching lines, not occurrences within each line. Quote patterns containing spaces or wildcards.',example:'find documents -name "*.txt"\ngrep -n -i linux documents/words.txt',terms:['find','grep'],tasks:[
 task('findtxt','Find text files','Search inside documents for files whose names end in .txt.','Quote the pattern "*.txt" after -name.','find documents -name "*.txt"',s=>commands(s).some(e=>e.args[0]==='find'&&pathAt(s,e.args[1]||'.',e.cwd)===HOME+'/documents'&&e.args.includes('-name')&&e.args.includes('*.txt'))),
 task('matching','Select lines','Save every schedule line containing Monday to practice/monday.txt.','Use grep and redirect its output to a file.','grep Monday documents/course/schedule.txt > practice/monday.txt',s=>contents(s,'practice/monday.txt')==='Monday: Linux practice\n'),
 task('case','Ignore case','Save all lines containing linux, regardless of capitalization, from documents/words.txt to practice/linux-lines.txt.','Use grep -i. There are three matching lines.','grep -i linux documents/words.txt > practice/linux-lines.txt',s=>contents(s,'practice/linux-lines.txt')==='Linux makes text searchable.\nlinux commands are case sensitive.\nPractice Linux every week.\n'),
 task('count','Count matching lines','Count lines containing OPEN in documents/visits.log and save only the number to practice/open-count.txt.','grep -c returns the number of matching lines.','grep -c OPEN documents/visits.log > practice/open-count.txt',s=>contents(s,'practice/open-count.txt')==='3\n')
 ]},
 {id:'sequence',label:'Command sequences',short:'06',desc:'Use command sequences, pipes, and redirection.',lesson:'A pipe (|) sends the output of one command to the input of another. > writes output to a file and replaces existing contents. >> appends. Commands can be entered one at a time. This practice terminal also supports ; and && to sequence successful commands.',example:'cat documents/course/schedule.txt | grep Linux\ngrep Linux documents/course/schedule.txt > practice/linux-days.txt',terms:['grep','cat','sort','uniq','cp','mv','echo'],tasks:[
 task('pipeline','Filter twice','Use a pipe to select only visits.log lines containing both OPEN and library. Save them to practice/library-open.txt.','Pipe the output of one grep into a second grep.','grep OPEN documents/visits.log | grep library > practice/library-open.txt',s=>contents(s,'practice/library-open.txt')==='08:00 OPEN library\n08:15 OPEN library\n'&&s.history.some(h=>tokenize(h).some(t=>t.op&&t.v==='|'))),
 task('organize','Create an organized copy','Create practice/review. Copy schedule.txt there as week.txt, and create an empty questions.txt beside it. Preserve the original schedule.','You need a directory, a copied file with a new name, and a second empty file.','mkdir practice/review; cp documents/course/schedule.txt practice/review/week.txt; touch practice/review/questions.txt',s=>contents(s,'practice/review/week.txt')===s.initialSchedule&&contents(s,'documents/course/schedule.txt')===s.initialSchedule&&contents(s,'practice/review/questions.txt')===''),
 task('extract','Build a short file','Create practice/first-three.txt containing exactly the first three schedule lines. Then display your new file.','Redirect head output, then use cat to verify the result.','head -n 3 documents/course/schedule.txt > practice/first-three.txt; cat practice/first-three.txt',s=>contents(s,'practice/first-three.txt')==='Monday: Linux practice\nTuesday: Reading files\nWednesday: Searching\n'&&read(s,'practice/first-three.txt')),
 task('independent','Combined task','Create ~/finished. Put a copy of notes.txt there named reference.txt and a file named linux-days.txt containing only schedule lines with Linux. Leave both originals unchanged.','Break the goal into three steps: create the directory, copy the notes, filter the schedule.','mkdir ~/finished; cp ~/documents/course/notes.txt ~/finished/reference.txt; grep Linux ~/documents/course/schedule.txt > ~/finished/linux-days.txt',s=>contents(s,'finished/reference.txt')===s.initialNotes&&contents(s,'finished/linux-days.txt')==='Monday: Linux practice\nThursday: Linux practice\n'&&contents(s,'documents/course/notes.txt')===s.initialNotes&&contents(s,'documents/course/schedule.txt')===s.initialSchedule)
 ]},
 {id:'permissions',label:'Permissions',short:'07',desc:'Read permissions and make controlled changes. Assign when ready.',lesson:'ls -l shows permissions for the owner, group, and others. r=4, w=2, x=1. chmod 600 gives the owner read/write and everyone else no access. Symbolic modes such as u+rw,go-rwx can express the same result. chown changes ownership and may require privileges; use it later in the real VM.',example:'ls -l documents/private.txt\nchmod 600 documents/private.txt\nls -l documents/private.txt',terms:['ls','chmod'],tasks:[
 task('private','Restrict a file','Set documents/private.txt so its owner can read and write, with no access for group or others.','Use 600 or u=rw,go=.','chmod 600 documents/private.txt',s=>s.fs[HOME+'/documents/private.txt'].mode===0o600),
 task('groupread','Allow group reading','Set documents/private.txt to owner read/write, group read, and no access for others.','The three numeric positions are owner, group, others.','chmod 640 documents/private.txt',s=>s.fs[HOME+'/documents/private.txt'].mode===0o640),
 task('readonly','Make a read-only copy','Copy notes.txt to practice/read-only.txt. Allow everyone to read it and nobody to write or execute it.','Copy first, then set mode 444.','cp documents/course/notes.txt practice/read-only.txt; chmod 444 practice/read-only.txt',s=>contents(s,'practice/read-only.txt')===s.initialNotes&&s.fs[HOME+'/practice/read-only.txt'].mode===0o444),
 task('scriptmode','Set executable permissions','Create an empty practice/run.sh file. Give its owner read/write/execute, its group read/execute, and others no access.','Use mode 750. The .sh extension alone does not set permissions or make this terminal execute scripts.','touch practice/run.sh; chmod 750 practice/run.sh',s=>exists(s,'practice/run.sh')&&s.fs[HOME+'/practice/run.sh'].mode===0o750)
 ]}
];

export const LESSONS={
  "identity": {
    "title": "Read the terminal prompt",
    "points": [
      "The prompt identifies the user, computer, and current folder.",
      "whoami prints the user; hostname prints the computer name; pwd prints the current folder.",
      "Type commands after the $ prompt. Do not type the $ itself."
    ],
    "goal": "Identify the current user and folder.",
    "steps": [
      {
        "command": "whoami",
        "why": "Read the username returned by the terminal."
      },
      {
        "command": "pwd",
        "why": "Read the full path of the current folder."
      }
    ]
  },
  "help": {
    "title": "Ask a command for help",
    "points": [
      "man takes a command name as its argument.",
      "A manual explains what the command does and which options it accepts."
    ],
    "goal": "Read about pwd, then use it.",
    "steps": [
      {
        "command": "man pwd",
        "why": "Look up the command before trying it."
      },
      {
        "command": "pwd",
        "why": "Use the command to display your current folder."
      }
    ]
  },
  "commandparts": {
    "title": "Command, option, path",
    "points": [
      "A command names the action. An option changes its behavior.",
      "In ls -l downloads, ls is the command, -l is the option, and downloads is the path."
    ],
    "goal": "Inspect downloads using a detailed listing.",
    "steps": [
      {
        "command": "ls downloads",
        "why": "List just the entry names."
      },
      {
        "command": "ls -l downloads",
        "why": "Compare the long listing: permissions, owner, size, and name."
      }
    ]
  },
  "returnhome": {
    "title": "Return to your home folder",
    "points": [
      "cd changes the current directory.",
      "cd with no argument, or cd ~, returns to your home directory.",
      "Use pwd to confirm where you ended up."
    ],
    "goal": "Visit /etc, then return home.",
    "steps": [
      {
        "command": "cd /etc",
        "why": "Move to an absolute path outside your home folder."
      },
      {
        "command": "cd ~",
        "why": "Use ~ as a shortcut to your home folder."
      },
      {
        "command": "pwd",
        "why": "Verify that you are back in /home/student."
      }
    ]
  },
  "locate": {
    "title": "Locate a file, then read it",
    "points": [
      "find searches for file paths; cat displays a file’s text.",
      "After finding a file, pass its full or relative path to cat."
    ],
    "goal": "Find agenda.txt in the example folders and read it.",
    "steps": [
      {
        "command": "find examples -name agenda.txt",
        "why": "Search the example folders for this exact filename."
      },
      {
        "command": "cat examples/club/agenda.txt",
        "why": "Read the file at the path returned by find."
      }
    ]
  },
  "relative": {
    "title": "Navigate with relative paths",
    "points": [
      "A relative path starts from your current directory.",
      "A path can contain several folders separated by /.",
      "Use pwd to check the resulting full path."
    ],
    "goal": "Enter examples/club from your home folder.",
    "steps": [
      {
        "command": "cd examples/club",
        "why": "Follow two folders using a relative path."
      },
      {
        "command": "pwd",
        "why": "The full path should end with /examples/club."
      }
    ]
  },
  "hidden": {
    "title": "Reveal hidden filenames",
    "points": [
      "Names beginning with a dot are normally hidden by ls.",
      "ls -a includes hidden entries. The dot is part of the filename."
    ],
    "goal": "Find and read the hidden tip inside examples.",
    "steps": [
      {
        "command": "ls examples",
        "why": "Look at the visible entries first."
      },
      {
        "command": "ls -a examples",
        "why": "Notice the extra .tip.txt entry."
      },
      {
        "command": "cat examples/.tip.txt",
        "why": "Include the leading dot when reading the file."
      }
    ]
  },
  "parent": {
    "title": "Move to the parent folder",
    "points": [
      ".. means the parent of your current folder.",
      ". means the current folder. Neither is a normal filename."
    ],
    "goal": "Move from examples/club to examples.",
    "steps": [
      {
        "command": "cd examples/club",
        "why": "Start two levels below your home folder."
      },
      {
        "command": "cd ..",
        "why": "Move up exactly one level."
      },
      {
        "command": "pwd",
        "why": "Check that the path now ends with /examples."
      }
    ]
  },
  "create": {
    "title": "Create a folder and a file",
    "points": [
      "mkdir creates a folder. touch creates an empty file if it is missing.",
      "Create the parent folder before creating a file inside it."
    ],
    "goal": "Create an example folder containing an empty checklist.",
    "steps": [
      {
        "command": "mkdir examples/project",
        "why": "Create the parent folder."
      },
      {
        "command": "touch examples/project/checklist.txt",
        "why": "Create a file inside that folder."
      },
      {
        "command": "ls examples/project",
        "why": "Verify that the file exists."
      }
    ]
  },
  "backup": {
    "title": "Copy while keeping the original",
    "points": [
      "cp takes a source path and a destination path.",
      "A destination can include a new filename. Copying leaves the source in place."
    ],
    "goal": "Make a renamed copy of the example club notes.",
    "steps": [
      {
        "command": "mkdir examples/archive",
        "why": "Create a destination folder."
      },
      {
        "command": "cp examples/club/notes.txt examples/archive/club-copy.txt",
        "why": "Copy the text and give the copy a new name."
      },
      {
        "command": "ls examples/club; ls examples/archive",
        "why": "Check that both the original and copy exist."
      }
    ]
  },
  "move": {
    "title": "Move and rename with mv",
    "points": [
      "mv takes a source and destination, just like cp.",
      "Moving removes the source entry. A new destination filename also renames it."
    ],
    "goal": "Move the example color file into the club folder with a new name.",
    "steps": [
      {
        "command": "mv examples/colors.txt examples/club/swatches.txt",
        "why": "Move and rename the file in one command."
      },
      {
        "command": "ls examples; ls examples/club",
        "why": "Check that only the destination contains the moved file."
      }
    ]
  },
  "cleanup": {
    "title": "Inspect a copy before deleting it",
    "points": [
      "Use cp to make a working copy without changing the original.",
      "Use cat to inspect it, then rm to remove only the copy."
    ],
    "goal": "Create, inspect, and remove a scratch copy of the example agenda.",
    "steps": [
      {
        "command": "cp examples/club/agenda.txt examples/scratch.txt",
        "why": "Make a temporary working copy."
      },
      {
        "command": "cat examples/scratch.txt",
        "why": "Confirm that this is the copy you intended to remove."
      },
      {
        "command": "rm examples/scratch.txt",
        "why": "Remove the scratch copy; the agenda remains in club."
      }
    ]
  },
  "firstlines": {
    "title": "Read the beginning of a file",
    "points": [
      "head shows the beginning of a file.",
      "-n chooses the number of lines; without it, head shows ten."
    ],
    "goal": "Display the first three lines of the example club notes.",
    "steps": [
      {
        "command": "cat examples/club/notes.txt",
        "why": "Look at the whole file for comparison."
      },
      {
        "command": "head -n 3 examples/club/notes.txt",
        "why": "Limit the output to the first three lines."
      }
    ]
  },
  "lastlines": {
    "title": "Read the end of a file",
    "points": [
      "tail shows the end of a file.",
      "-n selects how many final lines to display."
    ],
    "goal": "Read the last three lines of the example club agenda.",
    "steps": [
      {
        "command": "tail -n 3 examples/club/agenda.txt",
        "why": "Read from the end instead of the beginning."
      },
      {
        "command": "wc -l examples/club/agenda.txt",
        "why": "Count the file’s total lines for comparison."
      }
    ]
  },
  "write": {
    "title": "Write one line to a file",
    "points": [
      "echo prints the text you give it.",
      "> sends that output into a file, replacing any previous contents.",
      "Quote text containing spaces so it stays together."
    ],
    "goal": "Write a short example reminder and inspect it.",
    "steps": [
      {
        "command": "echo \"Bring your notebook.\" > examples/reminder.txt",
        "why": "Create a file containing one line."
      },
      {
        "command": "cat examples/reminder.txt",
        "why": "Check the exact text you saved."
      }
    ]
  },
  "append": {
    "title": "Append without erasing",
    "points": [
      "> creates or replaces a file’s contents.",
      ">> adds new output at the end, preserving existing text."
    ],
    "goal": "Create an example list containing Red and Blue on separate lines.",
    "steps": [
      {
        "command": "echo Red > examples/list.txt",
        "why": "Start a new file with the first line."
      },
      {
        "command": "echo Blue >> examples/list.txt",
        "why": "Append the second line instead of replacing the first."
      },
      {
        "command": "cat examples/list.txt",
        "why": "Verify that both lines are still present."
      }
    ]
  },
  "findtxt": {
    "title": "Find files by name",
    "points": [
      "find searches folder paths, not the text inside files.",
      "-name selects filenames matching a pattern. * means any sequence of characters.",
      "Quote wildcard patterns so the pattern reaches find as intended."
    ],
    "goal": "Find .log files under the example folder.",
    "steps": [
      {
        "command": "find examples -name \"*.log\"",
        "why": "Search all example subfolders for names ending in .log."
      }
    ]
  },
  "matching": {
    "title": "Select and save matching lines",
    "points": [
      "grep selects lines containing a pattern.",
      "Match capitalization exactly unless you use -i.",
      "Add > and a filename to save the selected lines."
    ],
    "goal": "Save the example agenda line containing Tuesday.",
    "steps": [
      {
        "command": "grep Tuesday examples/club/agenda.txt",
        "why": "Preview the matching line before saving it."
      },
      {
        "command": "grep Tuesday examples/club/agenda.txt > examples/tuesday.txt",
        "why": "Save that line into a new file."
      },
      {
        "command": "cat examples/tuesday.txt",
        "why": "Read the saved result."
      }
    ]
  },
  "case": {
    "title": "Search regardless of capitalization",
    "points": [
      "grep is case sensitive by default.",
      "-i treats uppercase and lowercase letters as equivalent."
    ],
    "goal": "Save every example line containing shell in any capitalization.",
    "steps": [
      {
        "command": "grep shell examples/words.txt",
        "why": "Notice that this matches only lowercase shell."
      },
      {
        "command": "grep -i shell examples/words.txt > examples/shell-lines.txt",
        "why": "Include Shell as well as shell and save the result."
      },
      {
        "command": "cat examples/shell-lines.txt",
        "why": "Verify that both matching lines were saved."
      }
    ]
  },
  "count": {
    "title": "Count matching lines",
    "points": [
      "grep -c returns a count instead of the matching text.",
      "The count is matching lines, even if a word occurs twice on one line."
    ],
    "goal": "Count example log lines containing CLOSE and save the number.",
    "steps": [
      {
        "command": "grep -n CLOSE examples/visits.log",
        "why": "Preview the matching lines with their line numbers."
      },
      {
        "command": "grep -c CLOSE examples/visits.log > examples/close-count.txt",
        "why": "Save just the count, not the log text."
      },
      {
        "command": "cat examples/close-count.txt",
        "why": "The example file contains one matching line."
      }
    ]
  },
  "pipeline": {
    "title": "Connect two filters with a pipe",
    "points": [
      "A pipe (|) passes the first command’s output to the next command.",
      "Two grep filters keep only lines matching both patterns.",
      "Put a redirect at the end to save the final result."
    ],
    "goal": "Save example log entries containing both OPEN and office.",
    "steps": [
      {
        "command": "grep OPEN examples/visits.log | grep office",
        "why": "Filter by status first, then by location."
      },
      {
        "command": "grep OPEN examples/visits.log | grep office > examples/office-open.txt",
        "why": "Save only the result of both filters."
      }
    ]
  },
  "organize": {
    "title": "Build an organized working folder",
    "points": [
      "Break a multi-step goal into smaller changes.",
      "Create the folder, copy a source file, then add any empty files.",
      "Check the finished folder with ls."
    ],
    "goal": "Make an example meeting folder with a copied agenda and an empty list.",
    "steps": [
      {
        "command": "mkdir examples/meeting",
        "why": "Create the destination."
      },
      {
        "command": "cp examples/club/agenda.txt examples/meeting/plan.txt",
        "why": "Copy and rename the agenda."
      },
      {
        "command": "touch examples/meeting/attendees.txt",
        "why": "Create a separate empty file."
      },
      {
        "command": "ls examples/meeting",
        "why": "Check the two filenames."
      }
    ]
  },
  "extract": {
    "title": "Save part of a file",
    "points": [
      "head can select a file’s first lines.",
      "Redirect the selected output, then use cat to verify the new file."
    ],
    "goal": "Save and display the first two example club-note lines.",
    "steps": [
      {
        "command": "head -n 2 examples/club/notes.txt > examples/short-notes.txt",
        "why": "Create a shorter file without changing the original."
      },
      {
        "command": "cat examples/short-notes.txt",
        "why": "Verify the saved result, rather than only the source."
      }
    ]
  },
  "independent": {
    "title": "Combine familiar skills",
    "points": [
      "Plan the result before choosing commands.",
      "Use mkdir for a destination, cp for an unchanged copy, and grep for selected text.",
      "Preserve originals when the goal asks for copies."
    ],
    "goal": "Create an example handout folder with club notes and only Art agenda lines.",
    "steps": [
      {
        "command": "mkdir examples/handouts",
        "why": "Prepare the destination folder."
      },
      {
        "command": "cp examples/club/notes.txt examples/handouts/tips.txt",
        "why": "Copy the notes with a new filename."
      },
      {
        "command": "grep Art examples/club/agenda.txt > examples/handouts/art-days.txt",
        "why": "Make a second file containing only the selected agenda lines."
      },
      {
        "command": "ls examples/handouts",
        "why": "Verify that both files are present."
      }
    ]
  },
  "private": {
    "title": "Read the three permission groups",
    "points": [
      "Permissions describe the owner, group, and others, in that order.",
      "For each group, read = 4, write = 2, and execute = 1. Add the values.",
      "chmod changes access; ls -l lets you inspect it."
    ],
    "goal": "Give only the owner read access to an example note.",
    "steps": [
      {
        "command": "chmod 400 examples/club/notes.txt",
        "why": "4 gives the owner read access; both 0 digits remove all other access."
      },
      {
        "command": "ls -l examples/club/notes.txt",
        "why": "Expect -r-------- for the example file."
      }
    ]
  },
  "groupread": {
    "title": "Choose a mode for each group",
    "points": [
      "Each digit controls one group: owner, group, then others.",
      "6 = read + write; 4 = read only; 0 = no access.",
      "A read-only owner can have a different mode from the group."
    ],
    "goal": "Give the example note read access for owner and group only.",
    "steps": [
      {
        "command": "chmod 440 examples/club/notes.txt",
        "why": "Set owner read, group read, and no access for others."
      },
      {
        "command": "ls -l examples/club/notes.txt",
        "why": "Expect -r--r----- for the example file."
      }
    ]
  },
  "readonly": {
    "title": "Protect a copy from changes",
    "points": [
      "Copy first so permission changes apply only to the working copy.",
      "A mode with no write bit prevents writing through this practice terminal.",
      "Read and execute are separate permissions."
    ],
    "goal": "Make an example agenda copy readable only by its owner.",
    "steps": [
      {
        "command": "cp examples/club/agenda.txt examples/agenda-copy.txt",
        "why": "Keep the source unchanged."
      },
      {
        "command": "chmod 400 examples/agenda-copy.txt",
        "why": "Give the owner read access, with no write or execute bits."
      },
      {
        "command": "ls -l examples/agenda-copy.txt",
        "why": "Inspect the new copy’s mode."
      }
    ]
  },
  "scriptmode": {
    "title": "Set the execute bit deliberately",
    "points": [
      "Execute = 1. Read + execute = 5; read + write + execute = 7.",
      "A .sh filename does not itself grant execute permission.",
      "This practice terminal changes permission bits but does not run scripts."
    ],
    "goal": "Create an example script file that only its owner can read and execute.",
    "steps": [
      {
        "command": "touch examples/check.sh",
        "why": "Create the empty file first."
      },
      {
        "command": "chmod 500 examples/check.sh",
        "why": "Set owner read/execute and no access for anyone else."
      },
      {
        "command": "ls -l examples/check.sh",
        "why": "Expect -r-x------ for the example file."
      }
    ]
  }
};
export function prepareExampleShell(snapshot){
 if(snapshot)return prepareShell(snapshot);
 const s=prepareShell();
 for(const path of ['examples','examples/club'])s.fs[HOME+'/'+path]={type:'d',mode:0o755,owner:'student'};
 const files={
 'examples/club/agenda.txt':'Monday: Robotics\nTuesday: Art\nWednesday: Robotics\nThursday: Music\nFriday: Art\n',
 'examples/club/notes.txt':'Arrive on time.\nBring a notebook.\nWork in pairs.\nSave your changes.\n',
 'examples/visits.log':'09:00 OPEN lab\n09:05 CLOSE lab\n09:10 OPEN office\n09:15 OPEN lab\n',
 'examples/words.txt':'Shell tools work with text.\nshell commands take arguments.\nRead a file before changing it.\n',
 'examples/.tip.txt':'A dot at the beginning hides a filename.\n',
 'examples/colors.txt':'orange\npurple\nteal\n'
 };
 for(const [path,text]of Object.entries(files))s.fs[HOME+'/'+path]={type:'f',text,mode:0o644,owner:'student'};
 return s;
}

export function prepareShell(snapshot){const s=new Shell(snapshot);const original=new Shell();s.initialNotes=original.fs[HOME+'/documents/course/notes.txt'].text;s.initialSchedule=original.fs[HOME+'/documents/course/schedule.txt'].text;return s;}
const recall=(topic,prompt,answers,explanation)=>({topic,type:'recall',prompt,answers,explanation});
const command=(topic,prompt,answer,explanation)=>({topic,type:'command',prompt,answer,explanation});
const choice=(topic,prompt,options,correct,explanation)=>({topic,type:'interpret',prompt,options,correct,explanation});
export const QUESTIONS=[
 recall('basics','Which command prints the current working directory?',['pwd'],'pwd means print working directory.'),
 recall('basics','Which command displays your username?',['whoami'],'whoami identifies the current user.'),
 command('basics','Open the manual for the ls command.','man ls','man takes the name of the command you want to learn about.'),
 recall('basics','Which command prints the computer’s name?',['hostname'],'hostname displays the system name.'),
 choice('basics','In grep -n Monday schedule.txt, which part is the option?',['grep','-n','Monday','schedule.txt'],1,'-n adds line numbers. Monday is the search pattern, and schedule.txt is the file.'),
 command('navigation','Starting in /home/student, change to the course folder inside documents.','cd documents/course','Either an absolute or relative path can reach the same directory.'),
 command('navigation','Starting in /home/student, list documents including hidden entries.','ls -a documents','-a includes dotfiles. -A also displays dotfiles but omits . and .. .'),
 command('navigation','Starting in /home/student, change to its parent directory.','cd ..','.. means the parent of the current directory.'),
 choice('navigation','You are in /home/student/documents. Where does cd ../downloads go?',['/home/student/downloads','/home/downloads','/downloads','/home/student/documents/downloads'],0,'Move to /home/student, then into downloads.'),
 choice('navigation','Which path starts at the filesystem root?',['documents/notes.txt','../notes.txt','/home/student/documents','./documents'],2,'An absolute path begins with /. The root directory differs from the root user.'),
 command('files','Create a folder named review in your current directory.','mkdir review','mkdir creates a directory.'),
 command('files','Create an empty file named draft.txt in your current directory.','touch draft.txt','touch creates a missing file without replacing existing file contents.'),
 command('files','Copy documents/course/notes.txt into practice, preserving its name.','cp documents/course/notes.txt practice/','cp preserves the source. A directory destination keeps the original filename.'),
 command('files','Rename downloads/colors.txt to downloads/palette.txt.','mv downloads/colors.txt downloads/palette.txt','mv can rename a file without changing its parent directory.'),
 choice('files','Which command removes an empty directory named old?',['rm old','rmdir old','touch old','cd old'],1,'rmdir removes empty directories. It reports an error for a nonempty directory.'),
 command('reading','Display documents/course/notes.txt.','cat documents/course/notes.txt','cat prints the contents of a text file.'),
 command('reading','Display the first two lines of documents/course/schedule.txt.','head -n 2 documents/course/schedule.txt','head -n 2 requests two lines.'),
 command('reading','Display the last two lines of documents/visits.log.','tail -n 2 documents/visits.log','tail reads from the end.'),
 command('reading','Count lines in documents/visits.log. Include the filename in the output.','wc -l documents/visits.log','wc -l counts newline characters. The supplied log ends each line with a newline.'),
 choice('reading','What does clear do?',['Deletes your files','Erases command history','Clears the terminal display','Returns to your home directory'],2,'clear changes the display. It does not erase shell history.'),
 command('search','Display lines containing OPEN in documents/visits.log.','grep OPEN documents/visits.log','grep searches inside the file.'),
 command('search','Display lines containing linux in documents/words.txt, ignoring capitalization.','grep -i linux documents/words.txt','-i ignores case.'),
 command('search','Display matching lines and line numbers for OPEN in documents/visits.log.','grep -n OPEN documents/visits.log','-n prefixes matching lines with line numbers.'),
 choice('search','A file has 3 lines. Each line contains Linux twice. What does grep -c Linux file.txt output?',['2','3','6','The matching text'],1,'grep -c counts matching lines, so the result is 3.'),
 command('search','Find files named schedule.txt anywhere under documents.','find documents -name schedule.txt','find searches paths. grep searches contents.'),
 command('sequence','Write Hello as one line to practice/hello.txt.','echo Hello > practice/hello.txt','> redirects output to a file, replacing its previous contents.'),
 command('sequence','Write Apples and Pears as separate lines to practice/list.txt.','echo Apples > practice/list.txt; echo Pears >> practice/list.txt','The second redirect appends. Using > twice loses the first line.'),
 choice('sequence','What does the pipe in cat notes.txt | grep Linux connect?',['The first command’s output to the second’s input','Two filenames','Two directories','The keyboard to a file'],0,'A pipe passes standard output to the next command’s standard input.'),
 command('sequence','Save only OPEN lines from documents/visits.log in practice/open.txt.','grep OPEN documents/visits.log > practice/open.txt','The resulting file should contain the matching lines.'),
 choice('sequence','What does >> do?',['Reads the first line','Appends output to a file','Deletes a directory','Changes permissions'],1,'>> appends. > replaces the file contents.'),
 command('permissions','Give only the owner read/write access to documents/private.txt.','chmod 600 documents/private.txt','600 means owner read/write, group none, others none. Symbolic equivalents also work.'),
 command('permissions','Give the owner read/write, the group read, and others no access to documents/private.txt.','chmod 640 documents/private.txt','The digits describe owner, group, and others in that order.'),
 choice('permissions','What permission does the digit 5 represent?',['Read and write','Write and execute','Read and execute','All permissions'],2,'5 = 4 + 1 = read + execute.'),
 choice('permissions','In -rw-r-----, what can others do?',['Read','Write','Read and write','No access'],3,'The last three positions are --- .'),
 command('permissions','Remove all access for group and others from documents/private.txt, keeping owner read/write.','chmod u=rw,go= documents/private.txt','Use numeric 600 or a symbolic expression with the same result.')
];
export function evaluateQuestion(q,answer){
 if(q.type==='interpret')return Number(answer)===q.correct;
 if(q.type==='recall')return q.answers.includes(answer.trim().toLowerCase());
 const student=prepareShell(),expected=prepareShell();const a=student.run(answer),b=expected.run(q.answer);if(!a.ok)return false;
 // Equivalent commands must produce the same filesystem, current directory and displayed result.
 const stable=s=>JSON.stringify(Object.keys(s.fs).sort().map(k=>[k,s.fs[k]]));
 const clean=x=>x.replace(/\/home\/student\//g,'').replace(/\.\//g,'').trim();
 // ls -a and ls -A both meet the stated hidden-file goal.
 if(q.answer==='ls -a documents')return student.cwd===HOME&&a.out.includes('.welcome.txt')&&a.out.includes('course')&&commands(student).some(e=>e.args[0]==='ls'&&e.args.some(v=>v.startsWith('-')&&/[aA]/.test(v))&&pathAt(student,e.args.slice(1).find(v=>!v.startsWith('-'))||'.',e.cwd)===HOME+'/documents');
 return stable(student)===stable(expected)&&student.cwd===expected.cwd&&clean(a.out)===clean(b.out);
}
