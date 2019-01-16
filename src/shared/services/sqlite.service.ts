import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular';

import { IThread, IUser } from '../interfaces';
import { ItemsService } from '../services/items.service';

@Injectable()
export class SqliteService {
    db: SQLite;
    db1: SQLiteObject;
    constructor(private itemsService: ItemsService, public http: Http, private sqlite: SQLite, private platform: Platform) {

    }

    InitDatabase() {
        this.platform.ready().then(() => {            
        this.db = new SQLite();
        this.db1 = this.db1;
            this.db.create({
            name: 'forumdb.db',
            location: 'default' // the location field is required
        }).then((db1: SQLiteObject) => {
            this.createThreads();
            this.createComments();
            this.createUsers();
        }, (err) => {
            console.error('Unable to open database: ', err);
        });
      });
    }

    resetDatabase() {
        
        this.resetUsers();
        this.resetThreads();
        this.resetComments();
    }

    resetUsers() {
        
        let query = 'DELETE FROM Users';
        this.db1.executeSql(query, []).then((data) => {
            console.log('Users removed');
        }, (err) => {
            console.error('Unable to remove users: ', err);
        });
    }

    resetThreads() {
        
        let query = 'DELETE FROM Threads';
        this.db1.executeSql(query, []).then((data) => {
            console.log('Threads removed');
        }, (err) => {
            console.error('Unable to remove Threads: ', err);
        });
    }

    resetComments() {
        
        let query = 'DELETE FROM Comments';
        this.db1.executeSql(query, []).then((data) => {
            console.log('Comments removed');
        }, (err) => {
            console.error('Unable to remove Commments: ', err);
        });
    }

    printThreads() {
        
        this.db1.executeSql('SELECT * FROM Threads', []).then((data) => {
            if (data.rows.length > 0) {
                for (var i = 0; i < data.rows.length; i++) {
                    console.log(data.rows.item(i));
                    console.log(data.rows.item(i).key);
                    console.log(data.rows.item(i).title);
                    console.log(data.rows.item(i).question);
                }
            } else {
                console.log('no threads found..');
            }
        }, (err) => {
            console.error('Unable to print threads: ', err);
        });
    }

    createThreads() {
        
        this.db1.executeSql('CREATE TABLE IF NOT EXISTS Threads ( key VARCHAR(255) PRIMARY KEY NOT NULL, title text NOT NULL, question text NOT NULL, category text NOT NULL, datecreated text, USER VARCHAR(255), comments INT NULL);', []).then(() => {
        }, (err) => {
            console.error('Unable to create Threads table: ', err);
        });
    }

    createComments() {
        
        this.db1.executeSql('CREATE TABLE IF NOT EXISTS Comments ( key VARCHAR(255) PRIMARY KEY NOT NULL, thread VARCHAR(255) NOT NULL, text text NOT NULL, USER VARCHAR(255) NOT NULL, datecreated text, votesUp INT NULL, votesDown INT NULL);', []).then(() => {
        }, (err) => {
            console.error('Unable to create Comments table: ', err);
        });
    }

    createUsers() {
        
        this.db1.executeSql('CREATE TABLE IF NOT EXISTS Users ( uid text PRIMARY KEY NOT NULL, username text NOT NULL); ', []).then(() => {
        }, (err) => {
            console.error('Unable to create Users table: ', err);
        });
    }

    saveUsers(users: IUser[]) {
        

        users.forEach(user => {
            this.addUser(user);
        });
    }

    addUser(user: IUser) {
        
        let query: string = 'INSERT INTO Users (uid, username) Values (?,?)';
        this.db1.executeSql(query, [user.uid, user.username]).then((data) => {
            console.log('user ' + user.username + ' added');
        }, (err) => {
            console.error('Unable to add user: ', err);
        });
    }

    saveThreads(threads: IThread[]) {
        let self = this;
        let users: IUser[] = [];

        threads.forEach(thread => {
            if (!self.itemsService.includesItem<IUser>(users, u => u.uid === thread.user.uid)) {
                console.log('in add user..' + thread.user.username);
                users.push(thread.user);
            } else {
                console.log('user found: ' + thread.user.username);
            }
            self.addThread(thread);
        });

        self.saveUsers(users);
    }

    addThread(thread: IThread) {
        

        let query: string = 'INSERT INTO Threads (key, title, question, category, datecreated, user, comments) VALUES (?,?,?,?,?,?,?)';
        this.db1.executeSql(query, [
            thread.key,
            thread.title,
            thread.question,
            thread.category,
            thread.dateCreated,
            thread.user.uid,
            thread.comments
        ]).then((data) => {
            console.log('thread ' + thread.key + ' added');
        }, (err) => {
            console.error('Unable to add thread: ', err);
        });
    }

    getThreads(): any {
        
        return this.db1.executeSql('SELECT Threads.*, username FROM Threads INNER JOIN Users ON Threads.user = Users.uid', []);
    }
}