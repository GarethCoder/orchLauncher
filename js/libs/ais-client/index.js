
define(function(){


    const http = {
      async post(url, {
        data
      }, verbose = true) {
        console.log(url);
        if (verbose) console.log({
          url,
          body: JSON.stringify(data)
        });
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // mode: 'cors', // or without this line
          redirect: 'follow',
          body: JSON.stringify(data)
        })
        // check headers for 404
        console.log("response status == " + response.status)
        //store.setWarning(results);
        if (response.status == "200") {
          const results = await response.json();
          // store.setWarning(JSON.stringify(results));
          if (verbose) console.log({
            results: JSON.stringify(results)
          });
          if (results.exception) {
            if (verbose) console.log({
              exception: results.message
            });
            //console.log({ ex: results.message, data });
            throw new Error(results.message);
          }
          return results;
        } else {
          console.log("other status than 200...")
          return null;
        }

      },
    };

    class AisFormServiceCall {
      constructor(options) {
        const defaults = {
          version: 'ZJDE0001',
          formActions: [],
          formInputs: [],
          returnControlIDs: '',
          deviceName: options.deviceName,
          formName: ''
        };
        Object.assign(this, defaults, options);
        return this;
      }
      _addAction(action) {
        this.formActions.push(action);
        return this;
      }
      _addInput(input) {
        this.formInputs.push(input);
        return this;
      }
      returns(returnIDs) {
        this.returnControlIDs = returnIDs;
        return this;
      }

    }

    class AisDataQuery {
      _addCondition(query) {
        query.autoFind = true; // autoFiund must be present in query
        query.matchType = "MATCH_ALL";
        //console.log(JSON.stringify(this.query.complexQuery));
        //console.log("existing query in AisDataQuery = "+JSON.stringify(this.query));
        // this.query = query;
        if (this.query.complexQuery == undefined) {
          this.query.complexQuery = [];
        }
        // this needs to be fixed to an array
        this.query = Object.assign({}, this.query, {
          autoFind: true,
          complexQuery: [
            ...this.query.complexQuery,
            {
              andOr: 'AND',
              query,
            },
          ],
        });
        //console.log("inside _addCondition after object.assign() this == "+JSON.stringify(this));
        delete this.query.condition;
      }
      setNext(obj) {
        this.next = obj;
      }
      nextLink() {
        const links = this.next || [];
        const {
          href: nextLink
        } = Object(links.find(l => l.rel === 'next'));
        return nextLink;
      }
      setQuery(query) {
        this.query = query;
        return this;
      }
      where(field) {
        this.whereField = field;
        delete this.query.complexQuery;
        return this;
      }
      and(field) {
        if (this.whereField) {
          throw new Error(
            'Previous where clause not complete, are you missing an operator like "in" or "eq"?'
          );
        }
        //console.log(JSON.stringify(this));
        this.whereField = field;
        return this;
      } in (valueArray) {
        if (!this.whereField) {
          throw new Error('You need to set "where" before "in"');
        }
        const complexQuery = valueArray.map(v => ({
          andOr: 'OR',
          query: {
            condition: [{
              controlId: `${this.targetName}.${this.whereField}`,
              operator: 'EQUAL',
              value: [{
                content: `${v}`,
                specialValueId: 'LITERAL',
              }],
            }, ],
          },
        }));
        this._addCondition({
          complexQuery
        });
        delete this.whereField;
        return this;
      }
      eq(value) {
        if (!this.whereField) {
          throw new Error('You need to set "where" before "eq"');
        }
        console.log("Value being passed into query == " + value);
        console.log("this object before adding the eq() method " + JSON.stringify(
          this))
        this.query.condition = [{
          controlId: `${this.targetName}.${this.whereField}`,
          operator: 'EQUAL',
          value: [{
            content: `${value}`,
            specialValueId: 'LITERAL',
          }],
        }]


        console.log("this object after adding the eq() method " + JSON.stringify(
          this))
        delete this.whereField;
        return this;
      }
      noteq(value) {
        if (!this.whereField) {
          throw new Error('You need to set "where" before "eq"');
        }
        //console.log("Value being passed into query == " + value);
        //console.log("this object before adding the eq() method " + JSON.stringify(
        //this))
        this._addCondition({
          condition: [{
            controlId: `${this.targetName}.${this.whereField}`,
            operator: 'NOT_EQUAL',
            value: [{
              content: `${value}`,
              specialValueId: 'LITERAL',
            }],
          }, ],
        });
        //console.log("this object after adding the eq() method " + JSON.stringify(
        //this))
        delete this.whereField;
        return this;
      }
      gt(value) {
        if (!this.whereField) {
          throw new Error('You need to set "where" before "gt"');
        }
        this._addCondition({
          condition: [{
            controlId: `${this.targetName}.${this.whereField}`,
            operator: 'GREATER',
            value: [{
              content: `${value}`,
              specialValueId: 'LITERAL',
            }],
          }, ],
        });
        delete this.whereField;
        return this;
      }
      lt(value) {
        if (!this.whereField) {
          throw new Error('You need to set "where" before "lt"');
        }
        this._addCondition({
          condition: [{
            controlId: `${this.targetName}.${this.whereField}`,
            operator: 'LESS',
            value: [{
              content: `${value}`,
              specialValueId: 'LITERAL',
            }],
          }, ],
        });
        delete this.whereField;
        return this;
      }
      lte(value) {
        if (!this.whereField) {
          throw new Error('You need to set "where" before "lte"');
        }
        this._addCondition({
          condition: [{
            controlId: `${this.targetName}.${this.whereField}`,
            operator: 'LESS_EQUAL',
            value: [{
              content: `${value}`,
              specialValueId: 'LITERAL',
            }],
          }, ],
        });
        //console.log("after less than or equal "+JSON.stringify(this));
        delete this.whereField;
        return this;
      }
      gte(value) {
        if (!this.whereField) {
          throw new Error('You need to set "where" before "gte"');
        }
        this._addCondition({
          condition: [{
            controlId: `${this.targetName}.${this.whereField}`,
            operator: 'GREATER_EQUAL',
            value: [{
              content: `${value}`,
              specialValueId: 'LITERAL',
            }],
          }, ],
        });
        delete this.whereField;
        return this;
      }
      select(fieldsArray) {
        if (typeof fieldsArray === 'string') {
          fieldsArray = [fieldsArray];
        }
        this.returnControlIDs = fieldsArray
          .map(name => `${this.targetName}.${name}`)
          .join('|');
        return this;
      }
      pageSize(size) {
        this.maxPageSize = size;
        return this;
      }
      orderAsc(fieldsArray) {
        if (typeof fieldsArray === 'string') {
          fieldsArray = [fieldsArray];
        }
        if (!this.orderField) this.orderField = {
          name: fieldsArray[0],
          direction: 1
        }
        this.aggregation.orderBy = fieldsArray.map(name => ({
          column: `${this.targetName}.${name}`,
          direction: 'ASC',
        }));
        return this;
      }
      orderDesc(fieldsArray) {
        if (typeof fieldsArray === 'string') {
          fieldsArray = [fieldsArray];
        }
        if (!this.orderField) this.orderField = {
          name: fieldsArray[0],
          direction:
            -1
        }
        this.aggregation.orderBy = fieldsArray.map(name => ({
          column: `${this.targetName}.${name}`,
          direction: 'DESC',
        }));
        return this;
      }
      constructor(options) {
        const defaults = {
          aliasNaming: true,
          outputType: 'VERSION1',
          targetType: 'table',
          dataServiceType: 'BROWSE',
          returnControlIDs: '',
          query: {
            autoFind: true,
            matchType: "MATCH_ALL",
            complexQuery: [],
            condition: [],
          },
          aggregation: {
            orderBy: [],
          },
        };
        Object.assign(this, defaults, options);
        return this;
      }
    }

    return class AisClient {
      // here AIS dataservice options can be set from the implementation
      createDataQuery(options) {
        // allow an options object or targetName string
        if (typeof options === 'string') {
          options = {
            targetName: options,
          };
        }
        const queryOptions = Object.assign({
            deviceName: this.credentials.deviceName
          },
          options);
        const query = new AisDataQuery(queryOptions, this.count);
        return query;
      }
      async logOut(token) {
        console.log("logging out of AIS session..." + token)

        var response = await http.post(`${this.url}/tokenrequest/logout`, {
          token: token,
        }, this.verbose);
        console.log(response);
      }
      createFormServiceCall(options) {
        if (typeof options === 'string') {
          options = {
            formName: options,
          };
        }
        const queryOptions = Object.assign({
            deviceName: this.credentials.deviceName
          },
          options);
        const query = new AisFormServiceCall(queryOptions, this.count);
        return query;
      }
      async fetch(query, mapper = simpleFieldMapper) {

        await this._ensureToken();
        // here we run the http call to AIS
        if (query.hasOwnProperty('targetName')) {
          const results = await http.post(`${this.url}/dataservice`, {
            data: Object.assign({}, query, {
              token: this.token
            }),
          }, this.verbose);
          store.debug = "results == " + JSON.stringify(results);
          if (results == null) {
            return null;
          }
          const {
            data: {
              gridData: {
                rowset = [],
                titles
              } = {}
            } = {}
          } =
          Object(results[`fs_DATABROWSE_${query.targetName}`]);
          // let testObj = results[`fs_DATABROWSE_${query.targetName}`];
          // const rows = testObj.data.gridData.rowset;
          // const myKeys = Object.keys(rows[0]);
          // console.log("typeof from testObj in AisClient == " + typeof testObj);
          // console.log("typeof from rows in AisClient == " + typeof rows);
          // console.log("rows in AisClient == " + JSON.stringify(rows));

          return typeof mapper === 'function' ? rowset.map(row => mapper(row,
            titles)) : rowset;

        } else {
          // mapper = simpleFormMapper;
          console.log("into the fetch and if === formservice")
          console.log(JSON.stringify(query));
          const results = await http.post(`${this.url}/formservice`, {
            data: Object.assign({}, query, {
              token: this.token
            }),
          }, this.verbose);
          console.log(JSON.stringify(results))
          const {
            data: {
              gridData: {
                rowset = [],
                titles
              } = {}
            } = {}
          } =
          Object(results[`fs_${query.formName}`]);
          //store.debug = data;

          //return typeof mapper === 'function' ? mapper(data) : data;
          return results;
        }

      }
      async fetchPageV1(query, mapper = simpleFieldMapper) {
        if (query.aggregation.orderBy.length !== 1) {
          throw new Error(
            'Version 1 query can only fetch by page if only a single orderBy element is specified.'
          );
        }
        await this._ensureToken();
        if (query.next) {
          query = query.and(query.orderField.name);
          if (query.orderField.direction > 1) {
            query = query.gt(query.next);
          } else {
            query = query.lt(query.next);
          }
        }
        const payload = {
          data: Object.assign({}, query, {
            token: this.token,
          }),
        };
        const results = await http.post(`${this.url}/dataservice`, payload, this.verbose);
        // return results[`fs_DATABROWSE_${query.targetName}`].data.gridData.rowset;
        const {
          data: {
            gridData: {
              rowset = [],
              columns
            } = {}
          } = {}
        } = Object
          (results[`fs_DATABROWSE_${query.targetName}`]);
        const pageResults = typeof mapper === 'function' ? rowset.map(row =>
          mapper(row, columns)) : rowset;
        if (pageResults && pageResults.length) {
          query.setNext(pageResults[pageResults.length - 1]);
        } else {
          delete query.next;
        }
        return pageResults;
      }
      async fetchPageV2(query, mapper = simpleFieldMapper) {
        await this._ensureToken();
        let nextLink = query.nextLink();
        const payload = nextLink ? {} : {
          data: Object.assign({}, query, {
            token: this.token,
            enableNextPageProcessing: true,
          }),
        };
        if (!nextLink) nextLink = `${this.url}/dataservice`;
        const results = await http.post(nextLink, payload, this.verbose);
        query.setNext(results.links);
        // return results[`fs_DATABROWSE_${query.targetName}`].data.gridData.rowset;
        const {
          data: {
            gridData: {
              rowset = [],
              titles
            } = {}
          } = {}
        } = Object
          (results[`fs_DATABROWSE_${query.targetName}`]);
        return typeof mapper === 'function' ? rowset.map(row => mapper(row,
          titles)) : rowset;
      }
      async simplePost(options) {
        const q = this.createDataQuery(options);
        const results = await this.fetch(q, null);
        return results;
      }
      async simpleFormCall(options) {
        //const q = this.createFormServiceCall(options);
        const results = await this.fetch(options, null);
        return results;
      }
      async _ensureToken(forceNew) {
        if (this.token && !forceNew) return;
        console.log(this.credentials);
        const response = await http.post(`${this.baseUrl}/tokenrequest`, {
          data: this.credentials,
        }, this.verbose);
        if (response) {
          this.token = response.userInfo.token;
          this.addressNumber = response.userInfo.addressNumber;
          //console.log('token response: ' + this.token);
          // TODO: move this to this.dateFormat once mapper becomes part of class
          this.dateFormat = response.userInfo.dateFormat;
        }

      }
      async getToken(forceNew) {
        await this._ensureToken(forceNew);
        return this.token;
      }
      async getAddressNumber() {
        await this._ensureToken();
        return this.addressNumber;
      }
      constructor({
        username,
        password,
        url,
        deviceName = 'AISCLIENT',
        version = 1,
        verbose = false
      }) {
        this.credentials = {
          username,
          password,
          deviceName,
        };

        this.version = version;
        this.baseUrl = `${url}/jderest`;
        this.url = version > 1 ? `${this.baseUrl}/v${version}` : this.baseUrl;
        this.verbose = verbose;
        this.fetchPage = version < 2 ? this.fetchPageV1 : this.fetchPageV2;
        // console.log(this)
        return this;
      }
    }


  })
