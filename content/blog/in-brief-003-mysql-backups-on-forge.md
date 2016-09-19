+++
author = ""
categories = []
date = "2016-03-01T10:00:00-07:00"
description = "How to use a simple cron job to generate nightly MySQL backups on Laravel Forge."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "In Brief #003: MySQL Backups On Forge"
type = "post"
tags = ["In Brief", "Laravel", "Forge", "MySQL"]

+++

_(Update: Forge auto-magically redirects cron job output to a job specific file, which means my cronjob below doesn't quite do what is expected. I've [written a new post](/blog/post/in-brief-004-mysql-backups-on-forge-part-2) about how this affects this strategy because it made more sense than trying to correct/update this one.)_

Shifting gears for a second, let’s chat about backups. I’m using [Laravel Forge](https://forge.laravel.com) to run deployments on top of [Linode](https://www.linode.com/) servers. Both are **ah-may-zing!**

Now that I’ve got some data piling up in my MySQL databases, I thought it wise to start backing up my few machines. Linode has a [terrific, no-frills backup service](https://www.linode.com/docs/security/backups/backup-service) that requires basically zero configuration to get going. 

The service will basically do a filewise backup—think rsync—of your server, so there are [some limitations](https://www.linode.com/docs/security/backups/backup-service#limitations) if you’ve locked your server down, or done something funky.

## But what about MySQL?

Depending on what storage engine(s) you use, you may or may not be able to restore from the files that the backup service copies. You may also end up with files that are out of sync, which, while not impossible to restore from, can be terribly frustrating.

Since I don’t yet have a huge dataset, I don’t need an enterprise-ready solution. So, I figured I’d just use `mysqldump`.

Here’s a couple of tips though:

1. **DO NOT** blindly follow the [Linode instructions](https://www.linode.com/docs/security/backups/back-up-your-mysql-databases#creating-backups-of-the-entire-database-management-system-dbms) for setting up your cron job. You should **absolutely never** put your password into a cron file, or expose it on the command line in clear text. Instead, add it to a `.my.cnf` file.
2. Use the `forge` user to run `mysqldump` instead of using `root`. The `forge` user was pretty much created for reasons like this, and has all the necessary MySQL permissions to dump your databases.
3. Use Forge’s “Scheduler” tab to manipulate your cron tab for you without all the `crontab -e ` fuss.

I opted to just dump all the databases, so I could do a complete restore, but you can dump [individual databases](https://www.linode.com/docs/security/backups/back-up-your-mysql-databases#creating-backups-of-a-single-database) or even [individual tables](https://www.linode.com/docs/security/backups/back-up-your-mysql-databases#creating-backups-of-a-single-table).

## Create .my.cnf
First, go ahead and add your password to `my.cnf` in the `forge` user’s home directory. 

_(Here, I’m assuming no such file exists, so adjust accordingly if you already have one inlace to avoid trampling existing settings.)_

SSH into your Linode (or whatever you’ve got), then:

    vi .my.cnf

##### /home/forge/.my.cnf
    [client]
    password=FORGE_MYSQL_PASSWORD_HERE

Now make sure only the `forge` user can read the file

    chmod 600 .my.cnf

## Add The Cron Job
Now, head over to your Forge console. The job we are going to add is this:

    /usr/bin/mysqldump --all-databases > dump-$( date '+%Y-%m-%d_%H-%M-%S' ).sql -u forge

That basically tells `mysqldump` to dump all of the databases ion the server to a file that starts with `dump-` and will have the date and time that the dump is executed.

If you don’t want to have more than one file—because, hey, we’re also backing up the server, right—then go ahead and change the name of the file to something like `dump-nightly.sql`.

Select the “Scheduler tab in your console and enter the above command. Make sure the user is `forge` and that “Nightly” is selected. 

![](/postimg/in-brief-003-mysql-backups-on-forge/scheduler-1.png "Forge Scheduler #1")

_(Note: This will run the job at precisely midnight [your server time]. I you want a different time, like 2am, choose “Custom” and adjust accordingly.)_

If everything looks good, click “Schedule Job” and the result should look similar to:

![](/postimg/in-brief-003-mysql-backups-on-forge/scheduler-2.png "Forge Scheduler #2")

That’s it!

## Going Further

I’m glossing over a ton of stuff here: deleting dumps after N days, even more security, more frequent / incremental dumps, etc.

As I get closer to deploying the services I’m working on, I will do more in depth articles on some of those topics. 

This is really a super-quick way to get started, and as always, there’s way more than one way to go when it comes to backups.