import { Injectable, OnInit } from '@angular/core';
import { Http, URLSearchParams, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Claim } from '../store/claim/claim.model';
import { ClaimRebuttal } from '../store/claim-rebuttal/claim-rebuttal.model';
import { Contact } from '../store/contact/contact.model';
import { Crisis } from '../store/crisis/crisis.model';
import { Hero } from '../store/hero/hero.model';
import { Note } from '../store/note/note.model';
import { Rebuttal } from '../store/rebuttal/rebuttal.model';
import { AppConfig } from '../../app.config';

/**
 * This mapping exists because I don't like pluralization of entity names. The JHipster
 * approach uses plurals so this takes care of that.
 */
const endpoints = {
    article: 'articles',
    claim: 'claims',
    claimRebuttal: 'claim-rebuttals',
    contact: 'contacts',
    crisis: 'crises',
    hero: 'heroes',
    note: 'notes',
    rebuttal: 'rebuttals',
    talk: 'talks'
};

@Injectable()
export class RESTService {
    constructor(private http: Http, private config: AppConfig) { }

    getEntities(table: string, query: { [key: string]: string } = {}): Observable<any[]> {
        const params: URLSearchParams = new URLSearchParams();

        Object.keys(query)
            .forEach((key) => {
                if (query[key] !== null) {
                    params.set(key, query[key]);
                }
            });

        const endpoint = endpoints[table] || table; // Could be a table name or a named endpoint TODO: reconsider this

        return this.http.get(`${this.config.apiUrl}/${endpoint}`, { search: params })
            .map(this.extractData)
            .catch(this.handleError);
    }

    // TODO: make table the first parameter of all of these

    getEntity(id: number | string, table: string): Observable<any> {
        return this.http.get(`${this.config.apiUrl}/${endpoints[table]}/${id}`)
            .map(this.extractData)
            .catch(this.handleError);
    }

    add(entity: any, table): Observable<any> {
        return this.http.post(`${this.config.apiUrl}/${endpoints[table]}`, this.prepareRecord(entity))
            .map(this.extractData)
            .catch(this.handleError);
    }

    update(entity: any, table): Observable<any> {
        return this.http.put(`${this.config.apiUrl}/${endpoints[table]}`, this.prepareRecord(entity))
            .map(this.extractData)
            .catch(this.handleError);
    }

    remove(entity: any, table): Observable<any> {
        return this.http.delete(`${this.config.apiUrl}/${endpoints[table]}/${entity.id}`)
            .map(this.extractData)
            .catch(this.handleError);
    }

    prepareRecord(record: any) {
        const newRecord = { ...record };
        delete newRecord.dirty;
        return newRecord;
    }

    extractData(res: any) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }

        const obj =
            (res && !!res._body && res.json()) ||
            res.data ||
            { id: res.url.match(/[^\/]+$/)[0] };

        return obj;
    }

    handleError(error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        const id = error.url.match(/[^\/]+$/)[0]; // if DELETE_FAIL, get id from resp.url

        return Observable.throw({ errMsg, id });
    }
}
