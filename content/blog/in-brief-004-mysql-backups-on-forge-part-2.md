+++
author = ""
categories = []
date = "2016-03-07T10:00:00-07:00"
description = "A follow up to the last In Brief post about using cron to make MySQL backups on Forge."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "In Brief #004: MySQL Backups On Forge, Part 2"
type = "post"

+++


If you read my last [In Brief](/blog/post/in-brief-003-mysql-backups-on-forge) post, you may have tried setting up a cron job to run `mysqldump` nightly, gone back to check the results the following day and found a zero byte file where you expected to see a dumpfile. 

    -rw-rw-r--  1 forge forge    0 Mar  5 00:00 dump-nightly.sql

Don't worry! The backup still ran, but Forge does some auto-magic output redirection that had me guessing for a little while.

## The Magic Of 2>&1

When I saw that my sql file was zero-length, I started trying to track down what went wrong. First stop was Forge's log file for the job in the web console. Viewing this showed that `mysqldump` had run just fine.

    -- MySQL dump 10.13  Distrib 5.7.10, for Linux (x86_64)
    --
    -- Host: localhost    Database: 
    -- ------------------------------------------------------
    -- Server version 5.7.10
    ...

And so on, for 87K worth of export. So, no problems there. Next up, I tried redirecting error output to a file with `2> /tmp/cronerrorfile` but this ended up creating a zero-length file as well. The reason for that was inconclusive as it could mean that a) there were no errors or b) something went wrong writing that output as well.

So then I checked the syslog by running `sudo grep CRON /var/log/syslog` and, with some scanning, found this line for the job I had set up:

    Mar  7 00:00:01 benjaminlistwon CRON[3707]: (forge) CMD (
        /usr/bin/mysqldump --all-databases
        > dump-nightly.sql -u forge 
        > /home/forge/.forge/scheduled-83194.log 2>&1)

_**(You may need to run the above on `syslog.1` if the current log file does not go back far enough.)**_

As you can see, Forge has added another output redirection to the end of the job, and has consolidated the `stderr` and `stdout` streams so that either an error or the actual output will be written to the file `scheduled-83194.log`.

Because of the way this command is executed, it will create both of the named files `dump-nightly.sql` and `/home/forge/.forge/scheduled-83194.log`, but the output of `mysqldump` will get redirected “through” the file we wanted, and into the last destination/open file descriptor in the redirection pipeline. 

Hence the zero-length file while still running without error.


## Pros And Cons

For every job you create through the Forge “Scheduled Jobs” console, a similar snippet of code will be added to your command, so let's think about some of the ramifications. 

First, some pros of this approach, as far as I can see right now:

1. Nightly output will only ever write to a single file, which means no need to worry about log rotation, etc.
2. All cron job output is in a single, well-organized directory.
3. Output, whether the desired output or an error, is captured in a single location, which can be convenient when debugging.

Now, the cons:

1. Nightly output will only ever write to a single file, thus if you need a dump from more than a day ago, and you have not snagged it in time, it will be overwritten.
2. I am not sure if all backup solutions, including Linode's, will copy dotfiles like the `.forge` directory. Especially if they are rsync-based, where you need to [explicitly include them](http://stackoverflow.com/questions/9046749/rsync-not-synchronizing-htaccess-file)
3. It is difficult to automate around this because the log file's name is not known until it is created, due to the suffix (e.g. `-83194`)


## What To Do Then?

Since my last post, I have learned a thing or two about some other mistakes I made in my command.

1. Only use absolute paths
2. Do not assume that the ENV is the user's ENV, unless you are testing for it
3. If a command starts getting sufficiently complex, consider running a script instead

This last bit has another advantage. When using a shell script, we can capture output at various stages, while allowing cron to log it's errors or success to the log file. In fact, that's all that should be written to the `/home/forge/.forge/scheduled-83194.log`, logging info from the job, not output from our commands.

In that spirit, here's what I did, and more importantly, verified!


## 1. Create .my.cnf
SSH into your Linode (or whatever you’ve got), then:

##### vi /home/forge/.my.cnf
    [client]
    password=FORGE_MYSQL_PASSWORD_HERE

Now make sure only the `forge` user can read the file

    chmod 600 .my.cnf


## 2. Create A Script To Run Backups
Here, I'm going to create the file as the forge user, then copy it into place as root so I can have a copy around to tinker with. Big thanks to [this SO thread](http://stackoverflow.com/questions/19731148/mysqldump-doesnt-work-in-crontab) for the meat of this script.

##### vi /home/forge/scripts/dumpdbs
    #!/bin/bash
    case $1 in 
    "backupall")
        /usr/bin/mysqldump --defaults-extra-file=/home/forge/.my.cnf --user=forge --all-databases > /home/forge/backups/dump-$(date +%d%m%y).sql
        tar -zcvf /home/forge/backups/dump-$(date +%d%m%y).tgz /home/forge/backups/dump-$(date +%d%m%y).sql
        rm /home/forge/backups/dump-$(date +%d%m%y).sql;;
    *)  echo "Not Implemented";;
    esac

Here's what's going on:

1. The `mysqldump` command is now receiving an explicit option to load our config file from the forge home directory. This option **must** be the first one after the `mysqldump` command. I am also explicitly providing the full path to all files involved. Be sure to create the `backups` directory before you do all of this.
2. The second line creates a gzipped tarball of the dump.
3. The third line removes the dumpfile so we just have the tarball

Now, copy the file into place and adjust the perms:

    sudo cp /home/forge/scripts/dumpdbs /usr/local/bin/.
    sudo chmod 755 /usr/local/bin/dumpdbs


## 3. Add The Cron Job

Over in the Forge console, set up a new job with the following command:

    /usr/local/bin/dumpdbs backupall

Be sure to specify `forge` as the user and select “Nightly” as the frequency. If you want to test the output right away, go ahead and create an “Every Minute” or “Custom” schedule to run the command in the short term. Just don't forget to remove it later! :-)

## One More Thing

This example will, of course, create loads of files, so you'll need to do some log rotation. Fortunately, `logrotate` is run daily by the system. It's a bit too much to cover here right now, but I will throw it into a future post.

For starters, check out this [backgrounder on logrotate](https://support.rackspace.com/how-to/understanding-logrotate-utility/) and some of the [samples in this article](https://support.rackspace.com/how-to/sample-logrotate-configuration-and-troubleshooting/).
