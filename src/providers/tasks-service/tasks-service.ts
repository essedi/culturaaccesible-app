import {Injectable} from '@angular/core';
import {SQLiteObject} from '@ionic-native/sqlite';
import {Events} from 'ionic-angular';
import {Observable} from "rxjs/Observable"
import {SQLite} from '@ionic-native/sqlite';


export const DATABASE_TABLE_CALL = "api_call";
export const DATABASE_TYPE_CALL_IMAGE = "image";
export const DATABASE_TYPE_CALL_POST = "post";
export const DATABASE_TYPE_CALL_PUT = "put";
//export const DATABASE_TABLE_RESPONSE = "api_response";
export const DATABASE_TABLE_RESPONSE = "api_call";

@Injectable()
export class TasksServiceProvider {
    
  db: SQLiteObject = null;

    constructor(
        public events: Events,
        public sqlite: SQLite,
    )
    {
    }

    setDatabase(db: SQLiteObject)
    {
        if (this.db === null)
        {
            this.db = db;
        }
    }
    getDatabase()
    {
        return this.db;
    }

    
    
    
    createTable(){
        
        
     //   let sql = 'DROP TABLE api_call';


      let sql = 'CREATE TABLE IF NOT EXISTS api_call(id INTEGER PRIMARY KEY AUTOINCREMENT, url VARCHAR(255),data TEXT,date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, parent_id INTEGER, type VARCHAR(255));';
        let sql2 = 'CREATE TABLE IF NOT EXISTS museums(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255) )';
        this.db.executeSql(sql2, []).then((res)=>{
            console.log(res,"create table record");
        }).catch((error)=>{
            console.log("not create table record");
            console.log(error);
        });
        return this.db.executeSql(sql, []);
    } 
    
    
   /* createTable2()
    { 
        let lthis = this;
        return new Promise(function (resolve, reject)
        {
            let sql = 'CREATE TABLE IF NOT EXISTS api_call(id INTEGER PRIMARY KEY AUTOINCREMENT, url VARCHAR(255), data TEXT,date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, parent_id INTEGER, type VARCHAR(255));';
              //let sql = 'CREATE TABLE IF NOT EXISTS ' + table + ';';

            lthis.db.executeSql(sql).then(
                (res) =>
                {
                    console.log("Datebase:  create table api_call", res);
                    resolve(res);
                },
                (err) =>
                {
                    console.log("Datebase:  create table error api_call" , err);
                    reject(err);
                }
            ).catch(
                (err) =>
                {
                    console.log("Datebase:  create table uncaught error api_call" , err);
                    reject(err);
                }
            );
        });
    }*/
    
    
    emptyTables()
    {
        let lthis = this;
        return new Promise(function (resolve, reject)
        {
            let tables = [DATABASE_TABLE_RESPONSE, DATABASE_TABLE_CALL];
            let results: any[] = [];
            for (let table of tables)
            {
                lthis.emptyTable(table).then(
                    (res) =>
                    {
                        results.push(res);
                        if (results.length == tables.length)
                        {
                            resolve(results);
                        }
                    },
                    (err) =>
                    {
                        results.push(err);
                        if (results.length == tables.length)
                        {
                            resolve(results);
                        }
                    }
                );
            }
        });
    }
    emptyTable(table: string)
    {
        let lthis = this;
        return new Promise(function (resolve, reject)
        {
            let sql = "TRUNCATE TABLE " + table + ";";

            lthis.db.executeSql(sql).then(
                (res) =>
                {
                    console.log("Datebase:  create table " + table, res);
                    resolve(res);
                },
                (err) =>
                {
                    console.log("Datebase:  create table error " + table, err);
                    reject(err);
                }
            ).catch(
                (err) =>
                {
                    console.log("Datebase:  create table uncaught error " + table, err);
                    reject(err);
                }
            );
        });
    }

    //Calls to server (posts and puts)
    getAllCalls()
    {
        let lthis = this;
        return new Promise(function (resolve, reject)
        {
            let sql = 'SELECT * FROM ' + DATABASE_TABLE_CALL + " WHERE parent_id IS NULL;";
            lthis.db.executeSql(sql).then(
                (resp) =>
                {
                    console.log("Database: get all calls  ", resp);
                    lthis.extractCalls(resp).then(
                        (res) =>
                        {
                            console.log("Database:   all calls  gets", res);
                            resolve(res);
                        },
                        (err) =>
                        {
                            console.log("Database:   all calls  gets error", err);
                            resolve(err);
                        }
                    );
                },
                (err) =>
                {
                    console.error("Database: get all calls  rejection", err);
                    lthis.extractCalls(err).then(
                        (res) =>
                        {
                            console.log("Database:  error all calls  gets ", res);
                            resolve(res);
                        },
                        (err) =>
                        {
                            console.log("Database:  error all calls  gets error ", err);
                            resolve(err);
                        }
                    );
                }
            ).catch(
                (err) =>
                {
                    console.error("Database: get all calls uncaught error", err);
                    reject(err);
                }
            );
        });
    }
    private extractCalls(query: any)
    {
        let lthis = this;
        return new Promise(function (resolve, reject)
        {
            let calls: any[] = [];
            let nulls: any[] = [];
            if (query.rows.length)
            {
                for (let index = 0; index <= query.rows.length; index++)
                {
                    let call: any = query.rows.item(index);
                    if (call)
                    {
                        //set childs
                        lthis.getChildsCalls(call.id).then(
                            (childs: any[]) =>
                            {
                                call.childs = childs;
                                calls.push(call);
                                if ((calls.length + nulls.length) >= query.rows.length)
                                {
                                    resolve(calls);
                                }
                            },
                            (childs: any[]) =>
                            {
                                call.childs = childs;
                                calls.push(call);
                                if ((calls.length + nulls.length) >= query.rows.length)
                                {
                                    resolve(calls);
                                }
                            }
                        );
                    } else
                    {
                        nulls.push(null);
                        if ((calls.length + nulls.length) >= query.rows.length)
                        {
                            resolve(calls);
                        }
                    }
                }
            } else
            {
                resolve(calls);
            }
        });
    }

    getChildsCalls(id: number)
    {
        let lthis = this;
        return new Promise(function (resolve, reject)
        {
            let sql = 'SELECT * FROM ' + DATABASE_TABLE_CALL + " WHERE parent_id=?;";
            lthis.db.executeSql(sql, [id]).then(
                (resp) =>
                {
                    console.log("Database: get all childs calls  ", resp);
                    lthis.extractCalls(resp).then(
                        (res) =>
                        {
                            resolve(res);
                        },
                        (err) =>
                        {
                            resolve(err);

                        }
                    );
                },
                (err) =>
                {
                    console.error("Database: get all childs calls rejection", err);
                    lthis.extractCalls(err).then(
                        (res) =>
                        {
                            resolve(res);
                        },
                        (err) =>
                        {
                            resolve(err);

                        }
                    );
                }
            ).catch(
                (err) =>
                {
                    console.error("Database: get all childs calls uncaught error", err);
                    reject(err);
                }
            );
        });
    }
    registerCall(url: string, data: any, parentId: number = null, type: string = DATABASE_TYPE_CALL_POST)
    {
        return new Observable<any>(
            (obs) =>
            {
                let obj = JSON.parse(data);
                this.createCall(url, data, parentId, type).then(
                    (res) =>
                    {
                        console.log("Database: register call ", res, url, obj);
                        obj.sqliteId = res.insertId;
                        obj.localStored = true;

                        obs.next(obj);
                        obs.complete();
                    },
                    (err) =>
                    {
                        console.log("Database: register call error", err, url, obj);
                        obs.error();
                        obs.complete();
                    }
                );
            }
        );

    }
    createCall(url: string, data: string, parentId: number = null, type: string)
    {
        let sql = 'INSERT INTO ' + DATABASE_TABLE_CALL + '(url,data,parent_id,type) VALUES(?,?,?,?)';
        return this.db.executeSql(sql, [url, data, parentId, type]);
    }
    deleteCall(id: any)
    {
        let sql = 'DELETE FROM ' + DATABASE_TABLE_CALL + ' WHERE id=?';
        return this.db.executeSql(sql, [id]);
    }
    getCall(id: number)
    {
        let sql = 'SELECT * FROM ' + DATABASE_TABLE_CALL + ' WHERE id=?';
        return this.db.executeSql(sql, [id]);
    }


    //responses from server (GETS)
    registerResponse(url: string, data: any)
    {
        //get for replace
        this.getResponse(url)
            .then(
                (res) =>
                {
                    console.log("Datebase: set response ", url, "data", data);
                    if (res != null)
                    {
                        this.updateResponse(url, JSON.stringify(data));
                    } else
                    {
                        this.createResponse(url, JSON.stringify(data));
                    }
                },
                (err) =>
                {
                    console.error("Datebase: set response error", err);
                }
            ).catch(
                (err) =>
                {
                    console.error("Datebase: set response uncaught error", err);
                }
            );
    }
    getResponse(url: string)
    {
        let sql = 'SELECT * FROM ' + DATABASE_TABLE_RESPONSE + ' WHERE url=?';
        return this.db.executeSql(sql, [url]).then(
            (res) =>
            {
                console.log("Database: get response", res);
                let result = null;
                if (res.rows.length)
                {
                    result = res.rows.item(0).data;
                }
                return Promise.resolve(result);
            },
            (err) =>
            {
                console.error("Database: get response error", err);
                return Promise.reject(err);
            }
        ).catch(
            (err) =>
            {
                console.error("Database: get response uncaught error", err);
                return Promise.reject(err);
            }
        );
    }
    createResponse(url: string, data: string)
    {
        console.log("createResponse");
        let sql = 'INSERT INTO ' + DATABASE_TABLE_RESPONSE + ' (url,data) VALUES(?,?)';
        return this.db.executeSql(sql, [url, data]);
    }
    updateResponse(url: string, data: string)
    {
        console.log("updateResponse");
        let sql = 'UPDATE ' + DATABASE_TABLE_RESPONSE + ' SET data=? WHERE url=?';
        return this.db.executeSql(sql, [data, url]);
    }


   createDatabase()
    {
        this.sqlite.create({
            name: 'data.cultura.db',
            location: 'default' // the location field is required
        })
        .then((db) => {
            console.log(db);
            
            this.setDatabase(db);
            console.log("create table");
            return this.createTable();
        })
        .catch(error =>{
            console.error(error);
        });
    }
    
    
   /* createDatabase()
    {
        let lthis = this;
        return new Promise(function (resolve, reject)
        {
            let opts =
            {
                name: 'com.essedi.itbook.audioguias',
                location: 'default' // the location field is required
            };
            lthis.sqlite.create(opts).then(
                (res) =>
                {
                    lthis.setDatabase(res);
                    console.log("Database: create local database", res);
                    
                    return lthis.createTable().then(
                        (res) =>
                        {
                            console.log(res, "lthis.createTable()");
                            resolve();
                        },
                        (err) =>
                        {   
                            console.log(err, "lthis.createTable() error");
                            resolve();
                        }
                    );
                },
                (err) =>
                {
                    console.error("Database: Fails to create local database", err);
                    reject(err);
                }
            ).catch(
                (err) =>
                {
                    console.error("Database: Fails to create local database", err);
                    reject(err);
                }
            );
        });
    } */
    
    
    
}
